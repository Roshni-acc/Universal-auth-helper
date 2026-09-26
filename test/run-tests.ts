import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UniversalAuth, JwtService, authMiddleware } from "../src";

async function runTests() {
  console.log("🧪 Starting Automated Test Suite for universal-auth-helper v1.1...\n");

  const TEST_SECRET = "test_super_secret_jwt_key_2026_xyz_123";
  process.env.JWT_SECRET = TEST_SECRET;

  const auth = new UniversalAuth({
    jwtSecret: TEST_SECRET,
    expiresIn: "1h"
  });

  let testUserToken = "";
  let testUserId = "";

  // 1. Register User Test
  console.log("Test 1: Register User with Valid Data");
  const testEmail = `testuser_${Date.now()}@example.com`;
  const registerResult = await auth.register({
    email: testEmail,
    password: "Password123!",
    name: "Test User"
  });

  if (!registerResult.id && !registerResult._id) {
    throw new Error("❌ FAIL: User registration failed to return an ID");
  }
  if ((registerResult as any).password) {
    throw new Error("❌ FAIL: User registration returned password hash!");
  }
  testUserId = (registerResult.id || registerResult._id).toString();
  console.log("  ✅ PASSED: User registered without password leakage.\n");

  // 2. Duplicate Registration Rejection
  console.log("Test 2: Duplicate Registration Rejection");
  try {
    await auth.register({
      email: testEmail,
      password: "Password123!"
    });
    throw new Error("❌ FAIL: Duplicate registration was not rejected!");
  } catch (err: any) {
    if (err.message.includes("already registered") || err.message.includes("User already exists")) {
      console.log("  ✅ PASSED: Duplicate registration cleanly rejected.\n");
    } else {
      throw err;
    }
  }

  // 3. Validation Rules (Invalid Email & Short Password)
  console.log("Test 3: Input Validation Rules");
  try {
    await auth.register({ email: "invalid-email-format", password: "Password123!" });
    throw new Error("❌ FAIL: Invalid email format accepted");
  } catch (err: any) {
    if (err.message.includes("Invalid email format")) {
      console.log("  ✅ Invalid email format rejected.");
    } else {
      throw err;
    }
  }

  try {
    await auth.register({ email: `valid_${Date.now()}@example.com`, password: "123" });
    throw new Error("❌ FAIL: Short password accepted");
  } catch (err: any) {
    if (err.message.includes("Password must be at least")) {
      console.log("  ✅ Short password rejected.");
    } else {
      throw err;
    }
  }
  console.log("  ✅ PASSED: Validation rules enforced.\n");

  // 4. Successful Login
  console.log("Test 4: Successful User Login");
  const loginResult = await auth.login(testEmail, "Password123!");
  if (!loginResult.token) {
    throw new Error("❌ FAIL: Login did not return a JWT token");
  }
  if (loginResult.user.password) {
    throw new Error("❌ FAIL: Login returned password hash");
  }
  testUserToken = loginResult.token;
  console.log("  ✅ PASSED: User logged in, valid JWT token generated.\n");

  // 5. Wrong Password & Email Obfuscation Handling
  console.log("Test 5: Login Failure Obfuscation (Wrong Password / User)");
  try {
    await auth.login(testEmail, "WrongPassword!");
    throw new Error("❌ FAIL: Wrong password was accepted");
  } catch (err: any) {
    if (err.message === "Invalid email or password") {
      console.log("  ✅ Wrong password rejected with uniform message.");
    } else {
      throw new Error(`❌ FAIL: Expected generic error message, got: ${err.message}`);
    }
  }

  try {
    await auth.login("nonexistent@example.com", "Password123!");
    throw new Error("❌ FAIL: Non-existent user login succeeded");
  } catch (err: any) {
    if (err.message === "Invalid email or password") {
      console.log("  ✅ Non-existent user login rejected with uniform message.");
    } else {
      throw new Error(`❌ FAIL: Expected generic error message, got: ${err.message}`);
    }
  }
  console.log("  ✅ PASSED: Generic error returned for login failures.\n");

  // 6. Middleware Authorization Test
  console.log("Test 6: Middleware Verification with Valid Token");
  const reqValid: any = {
    headers: { authorization: `Bearer ${testUserToken}` }
  };
  const resValid: any = { status: () => resValid, json: () => resValid };
  let middlewareCalledNext = false;
  await authMiddleware(reqValid, resValid, () => {
    middlewareCalledNext = true;
  });

  if (!middlewareCalledNext || !reqValid.user || reqValid.user.email !== testEmail) {
    throw new Error("❌ FAIL: Middleware failed to attach decoded user object to req.user");
  }
  console.log("  ✅ PASSED: Middleware verified JWT and attached req.user.\n");

  // 7. Invalid & Expired Token Rejection
  console.log("Test 7: Invalid Token Rejection in Middleware");
  const reqInvalid: any = { headers: { authorization: "Bearer invalid_fake_token_123" } };
  let statusCaptured = 0;
  let errorCaptured = "";
  const resInvalid: any = {
    status: (code: number) => {
      statusCaptured = code;
      return resInvalid;
    },
    json: (body: any) => {
      errorCaptured = body.error || body.message;
      return resInvalid;
    }
  };
  await authMiddleware(reqInvalid, resInvalid, () => {});
  if (statusCaptured !== 401 || !errorCaptured.toLowerCase().includes("invalid")) {
    throw new Error(`❌ FAIL: Invalid token returned status ${statusCaptured} - ${errorCaptured}`);
  }
  console.log("  ✅ PASSED: Invalid token correctly rejected with 401.\n");

  console.log("Test 8: Expired Token Rejection in Middleware");
  const expiredToken = jwt.sign(
    { id: testUserId, email: testEmail },
    TEST_SECRET,
    { expiresIn: "-1s" }
  );
  const reqExpired: any = { headers: { authorization: `Bearer ${expiredToken}` } };
  let statusExpired = 0;
  let messageExpired = "";
  const resExpired: any = {
    status: (code: number) => {
      statusExpired = code;
      return resExpired;
    },
    json: (body: any) => {
      messageExpired = body.error || body.message;
      return resExpired;
    }
  };
  await authMiddleware(reqExpired, resExpired, () => {});
  if (statusExpired !== 401 || messageExpired !== "Token expired") {
    throw new Error(`❌ FAIL: Expired token expected 401 "Token expired", got status ${statusExpired} - ${messageExpired}`);
  }
  console.log("  ✅ PASSED: Expired token handled specifically as 401 'Token expired'.\n");

  // 8. Logout & Blacklist Check
  console.log("Test 9: Logout & Token Blacklisting");
  await auth.logout(testUserToken);
  let statusBlacklisted = 0;
  let messageBlacklisted = "";
  const reqBlacklisted: any = { headers: { authorization: `Bearer ${testUserToken}` } };
  const resBlacklisted: any = {
    status: (code: number) => {
      statusBlacklisted = code;
      return resBlacklisted;
    },
    json: (body: any) => {
      messageBlacklisted = body.error || body.message;
      return resBlacklisted;
    }
  };
  await authMiddleware(reqBlacklisted, resBlacklisted, () => {});
  if (statusBlacklisted !== 401 || !messageBlacklisted.toLowerCase().includes("blacklisted") && !messageBlacklisted.toLowerCase().includes("revoked")) {
    throw new Error(`❌ FAIL: Blacklisted token was not rejected by middleware! Status: ${statusBlacklisted}`);
  }
  console.log("  ✅ PASSED: Token blacklisted on logout and rejected by middleware.\n");

  // 9. Profile Retrieval
  console.log("Test 10: Fetch Profile");
  const profile = await auth.getProfile(testUserId);
  if (profile.email !== testEmail) {
    throw new Error("❌ FAIL: Profile email mismatch");
  }
  if (profile.password) {
    throw new Error("❌ FAIL: Profile returned password hash");
  }
  console.log("  ✅ PASSED: User profile fetched without sensitive fields.\n");

  console.log("🎉 ALL 10 AUTOMATED TEST SUITE CHECKS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("💥 TEST SUITE FAILED:", err.message);
  process.exit(1);
});
