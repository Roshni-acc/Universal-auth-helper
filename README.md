# universal-auth-helper

> Production-ready Universal Authentication Engine for Express & MongoDB with embedded React Developer Studio & live token telemetry.

`universal-auth-helper` is a zero-boilerplate, all-in-one authentication SDK designed to streamline JWT Bearer authentication, Express session cookies, Passport.js OAuth2 social logins, and token blacklisting for Express and MongoDB applications.

---

## ⚡ Quick-Start (3 Lines of Code!)

### 1. Installation

```bash
npm install universal-auth-helper express mongoose jsonwebtoken passport
```

### 2. Express Server Setup

```typescript
import express from "express";
import { UniversalAuth } from "universal-auth-helper";

const app = express();

// 1. Initialize Universal Auth (Configures JWT, Sessions, Passport, MongoDB & Studio UI)
const auth = UniversalAuth.init(app, {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET, // Strong secret required
  expiresIn: "24h" // Configurable JWT expiration (e.g., '1h', '7d', '24h')
});

// 2. Protect routes with built-in JWT middleware
app.get("/api/dashboard", UniversalAuth.jwtMiddleware(), (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
```

When your server starts, navigate to `http://localhost:5000` to access the embedded **Universal Auth Studio** UI!

---

## 🔑 Core API Usage

### High-Level SDK Instance (`UniversalAuth`)

```typescript
import { UniversalAuth } from "universal-auth-helper";

const auth = new UniversalAuth({
  jwtSecret: process.env.JWT_SECRET,
  expiresIn: "7d"
});

// 1. Register User (Includes Email Format & Password Validation)
const user = await auth.register({
  email: "user@example.com",
  password: "strongPassword123",
  name: "John Doe"
});

// 2. Login User (Returns JWT token and sanitized user without password hash)
const { token, user: loggedInUser } = await auth.login("user@example.com", "strongPassword123");

// 3. Fetch User Profile
const profile = await auth.getProfile(user.id);

// 4. Logout User (Blacklists the token immediately)
await auth.logout(token);
```

---

## 🛡️ Route Middleware Protection

Protect any Express endpoint using `UniversalAuth.jwtMiddleware()` or standalone `authMiddleware`:

```typescript
import express from "express";
import { UniversalAuth } from "universal-auth-helper";

const app = express();

// Automatically extracts Authorization: Bearer <token>, checks JWT signature, handles TokenExpiredError, checks revocation blacklist, and attaches req.user
app.get("/profile", UniversalAuth.jwtMiddleware(), (req, res) => {
  res.json({ status: true, user: req.user });
});
```

---

## 📦 Direct Service & Controller Exports

For custom application architectures, `universal-auth-helper` exports low-level services and controllers:

```typescript
import {
  UniversalAuth,
  JwtService,
  JwtController,
  SessionService,
  Auth2Service,
  auth2Controller,
  authMiddleware,
  checkBlacklist
} from "universal-auth-helper";

const jwtService = new JwtService({
  jwtSecret: process.env.JWT_SECRET,
  expiresIn: "1h"
});
```

---

## 🚀 Key Features & Security Design

- **Unified Auth Engine**: Replaces complex boilerplate with a single `UniversalAuth.init(app)` or `new UniversalAuth()` call.
- **Strict Input Validation**: Validates email format, missing fields, minimum password length (>= 6 chars), and rejects duplicate registrations.
- **Obfuscated Login Errors**: Uniform `"Invalid email or password"` error prevents account enumeration vulnerabilities.
- **Sensitive Data Filtering**: Password hashes are strictly omitted from all registration, login, profile, session, and OAuth responses.
- **Active Token Revocation**: Logout immediately blacklists the JWT in MongoDB or resilient memory store; protected middleware rejects blacklisted tokens with 401.
- **Token Expiration Handling**: Middleware catches `TokenExpiredError` specifically and returns `{ status: false, message: "Token expired", error: "Token expired" }`.
- **Full TypeScript Support**: Includes TypeScript interfaces (`AuthConfig`, `RegisterData`, `AuthUser`, `AuthResponse`) and ambient `Express.Request.user` typing.

---

## 🔒 Security Requirements

1. **JWT_SECRET Configuration**: Always set a strong `JWT_SECRET` environment variable (at least 32 characters long).
2. **HTTPS in Production**: Transmit Bearer tokens over encrypted HTTPS in production (`NODE_ENV=production`).

---

## 📄 License

[MIT License](LICENSE) © 2026 Roshni Singh
