# 📘 Universal Auth Helper — Comprehensive Codebase & Architecture Guide

Welcome to the complete code-level documentation for `universal-auth-helper` (v1.1.1). This guide provides a detailed, line-by-line and section-by-section breakdown of all components, services, controllers, repositories, middleware, TypeScript types, and tests in this package.

---

## 📐 1. High-Level Architecture Overview

`universal-auth-helper` is structured as a layered, resilient architecture designed to run seamlessly both **with** MongoDB Atlas and **without** a database (using auto-healing in-memory fallback stores).

```
                      +---------------------------------------+
                      |   NPM Package Consumer App (Express)  |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |     UniversalAuth (SDK Façade Class)  |
                      +---------------------------------------+
                                          |
             +----------------------------+----------------------------+
             |                            |                            |
             v                            v                            v
  +--------------------+       +---------------------+       +-------------------+
  |  authMiddleware    |       |     JwtController   |       |  auth2Controller  |
  +--------------------+       +---------------------+       +-------------------+
             |                            |                            |
             v                            v                            v
  +------------------------------------------------------------------------------+
  |              JwtService / Auth2Service / SessionService                      |
  +------------------------------------------------------------------------------+
                                          |
                                          v
  +------------------------------------------------------------------------------+
  |                   JwtRepository / BlacklistRepository                        |
  +------------------------------------------------------------------------------+
                         /                                 \
                        v                                   v
             +---------------------+               +------------------+
             | Mongoose (MongoDB)  |               |  In-Memory Store |
             +---------------------+               +------------------+
```

---

## 🗂️ 2. File-by-File Code Walkthrough & Logic Explanation

---

### 1. `src/index.ts` — Package Entry Point

This file serves as the public NPM module entry point (`"main": "dist/index.js"` and `"types": "dist/index.d.ts"` in `package.json`).

```typescript
export { UniversalAuth } from "./sdk/UniversalAuth";
export { JwtService } from "./services/jwt";
export { JwtController } from "./controllers/jwt";
export { Auth2Service } from "./services/oauth2";
export { auth2Controller } from "./controllers/oAuth2";
export { SessionService } from "./services/session";
export { authMiddleware } from "./middleware/jwt";
export { checkBlacklist } from "./middleware/blacklist";
export {
  initDeploySenseGlobalLogger,
  deploySenseExpressMiddleware,
  sendDeploySenseLog
} from "./middleware/dep";
export * from "./types";
```

#### Line-by-Line Logic Explanation:
- **Lines 1-8**: Re-exports high-level classes (`UniversalAuth`), core domain services (`JwtService`, `SessionService`, `Auth2Service`), controllers, and middleware (`authMiddleware`, `checkBlacklist`).
- **Lines 9-13**: Re-exports DeploySense AI crash monitoring helpers.
- **Line 14**: Re-exports all TypeScript interfaces (`AuthConfig`, `RegisterData`, `AuthUser`, `AuthResponse`) so consumers receive rich auto-complete when importing `universal-auth-helper`.

---

### 2. `src/types/index.ts` — TypeScript Type Definitions & Express Augmentation

```typescript
import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export interface JwtServiceOptions {
  jwtSecret?: string;
  expiresIn?: string | number;
}

export interface UniversalAuthOptions {
  mongoUri?: string;
  jwtSecret?: string;
  sessionSecret?: string;
  expiresIn?: string | number;
  enableOAuth?: boolean;
  enableUI?: boolean;
  oauthConfig?: Record<string, any>;
  deploySense?: {
    enabled?: boolean;
    url?: string;
    serviceName?: string;
    environment?: string;
  };
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      _id?: string;
      email?: string;
      name?: string;
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}
```

#### Line-by-Line Logic Explanation:
- **Lines 3-9 (`AuthUser`)**: Defines the sanitized user payload shape returned to clients.
- **Lines 11-17 (`RegisterData`)**: Specifies input expectations for user registration.
- **Lines 26-31 (`JwtServiceOptions`)**: Configuration options for standalone `JwtService` instances.
- **Lines 33-47 (`UniversalAuthOptions`)**: Global configuration interface for `UniversalAuth.init(app, options)`.
- **Lines 49-62 (`declare global`)**: Ambiently extends Express's `Request.user` and `Express.User` interfaces. When a developer installs the package, TypeScript automatically recognizes `req.user.email`, `req.user.id`, etc.

---

### 3. `src/sdk/UniversalAuth.ts` — High-Level SDK Class & Express Integrator

This class acts as the main façade for developer interactions.

```typescript
export class UniversalAuth {
  private static instance: UniversalAuth;
  public jwtService: JwtService;
  public jwtController: JwtController;
  private isMongoConnected: boolean = false;
  private options: UniversalAuthOptions;

  constructor(options: UniversalAuthOptions = {}) {
    this.options = options;

    if (options.jwtSecret) process.env.JWT_SECRET = options.jwtSecret;
    if (options.sessionSecret) process.env.SESSION_SECRET = options.sessionSecret;
    if (options.mongoUri) process.env.MONGO_URI = options.mongoUri;

    this.jwtService = new JwtService({
      jwtSecret: options.jwtSecret || process.env.JWT_SECRET,
      expiresIn: options.expiresIn || "24h"
    });
    this.jwtController = new JwtController(this.jwtService);
  }
```

#### Line-by-Line Logic Explanation:
- **Constructor**: Initializes `JwtService` and `JwtController` instances, setting global environment variables for `JWT_SECRET` and `SESSION_SECRET` if provided.
- **`register(data)`**: Direct instance method to register a user programmatically.
- **`login(email, password)`**: Direct instance method to authenticate credentials and issue tokens.
- **`logout(token)`**: Adds the token to the blacklisting store.
- **`getProfile(userId)`**: Retrieves sanitized user details by ID.
- **`UniversalAuth.init(app, options)`**:
  1. Establishes optional Mongoose database connection.
  2. Configures CORS headers (`Access-Control-Allow-*`).
  3. Mounts `express.json()`, `express.urlencoded()`, and `cookieParser()`.
  4. Configures session middleware using `MongoStore` (if MongoDB connected) or `MemoryStore` fallback.
  5. Initializes Passport.js for OAuth2 social authentication.
  6. Mounts static React Developer Studio UI files from `public/`.
  7. Configures DeploySense AI error reporting if enabled.
- **`UniversalAuth.jwtMiddleware()`**: Returns `authMiddleware` for protecting Express routes.

---

### 4. `src/services/jwt.ts` — Core JWT Engine & Security Logic

Contains all business logic for registration, authentication, token signing, validation, and error obfuscation.

```typescript
export class JwtService {
  private jwtrepo = new JwtRepository();
  private blacklistRepo = new BlacklistRepository();
  private jwtSecret?: string;
  private expiresIn: string | number;

  constructor(options: JwtServiceOptions = {}) {
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET;
    this.expiresIn = options.expiresIn || "24h";
  }

  private getSecret(): string {
    const secret = this.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is required. Please set process.env.JWT_SECRET or pass jwtSecret in options.");
    }
    return secret;
  }
```

#### `register(data)` Logic:
1. **Input Presence Validation**: Checks if data object exists.
2. **Email Formatting & Normalization**: Trims and converts email to lowercase.
3. **Regex Email Validation**: Enforces valid format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
4. **Password Length Validation**: Requires password to be at least 6 characters long.
5. **Duplicate Email Check**: Rejects registration if user email already exists.
6. **Bcrypt Password Hashing**: Hashes raw password using `bcrypt.hash(password, 10)` (salt rounds = 10).
7. **Sensitive Property Sanitization**: Destructures and removes `password` and `__v` before returning the created user object.

#### `login(email, password)` Logic:
1. **Presence Verification**: Ensures email and password parameters are provided.
2. **User Lookup**: Queries repository for user matching normalized email.
3. **Generic Error Obfuscation**: If user is not found, throws `"Invalid email or password"`.
4. **Bcrypt Password Comparison**: Compares plain password with hashed DB password via `bcrypt.compare()`.
5. **Generic Error Obfuscation**: If comparison fails, throws `"Invalid email or password"`. (Prevents account enumeration!).
6. **Token Generation**: Signs JWT payload (`id`, `email`, `name`, `role`) with `JWT_SECRET` and configured `expiresIn`.
7. **Sanitized Return**: Returns `{ token, user }` where user contains no sensitive fields.

#### `logout(token)` Logic:
- Extracts token (stripping `"Bearer "` prefix if present) and saves it to `blacklistRepo`.

---

### 5. `src/middleware/jwt.ts` — Authentication & Revocation Guard

```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: "No token provided", error: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.split(" ")[1] || authHeader.trim();

    if (!token) {
      return res.status(401).json({ status: false, message: "No token provided", error: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ status: false, error: "JWT_SECRET is not configured" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ status: false, message: "Token expired", error: "Token expired" });
      }
      return res.status(401).json({ status: false, message: "Invalid token", error: "Invalid token" });
    }

    const isBlacklisted = await blacklistRepo.find(token);
    if (isBlacklisted) {
      return res.status(401).json({ status: false, message: "Token has been revoked (logged out)", error: "Token blacklisted" });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ status: false, message: "Authentication failed", error: err.message });
  }
};
```

#### Line-by-Line Logic Flow:
1. **Header Extraction**: Reads `req.headers.authorization`. Returns `401` if header is missing.
2. **Token Parsing**: Strips `"Bearer "` prefix to obtain the raw JWT string.
3. **Secret Enforcement**: Ensures `process.env.JWT_SECRET` is set; returns `500` error if unconfigured.
4. **JWT Verification (`jwt.verify`)**:
   - Catches `TokenExpiredError` explicitly -> returns `401 { message: "Token expired" }`.
   - Catches `JsonWebTokenError` -> returns `401 { message: "Invalid token" }`.
5. **Blacklist Query**: Checks if the token exists in `BlacklistRepository`. Returns `401` if blacklisted (revoked).
6. **Request Attachment**: Attaches `req.user = decoded` and calls `next()` to yield control to the route handler.

---

### 6. `src/repositories/jwt.ts` & `src/repositories/blacklist.ts` — Data Access Layer

Implements hybrid persistence: automatically uses MongoDB if `mongoose.connection.readyState === 1`, otherwise seamlessly falls back to an in-memory `Map` / `Set`.

```typescript
export class JwtRepository {
  async create(user: User): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      return userModel.create(user);
    }
    
    // In-memory fallback
    const id = "usr_" + Math.random().toString(36).substring(2, 10);
    const newUser = {
      _id: id,
      ...user,
      created_at: user.created_at || new Date(),
      toObject: () => ({ _id: id, ...user })
    };
    memoryUsers.set(id, newUser);
    return newUser;
  }
```

---

### 7. `src/controllers/jwt.ts` — Express Route Controllers

Maps Express HTTP requests (`req`, `res`) directly to `JwtService` logic:
- `register(req, res)` -> Status `201` on success, Status `400` on validation error.
- `login(req, res)` -> Status `200` on success with `{ token, user }`, Status `401` on authentication failure.
- `profile(req, res)` -> Resolves user profile from `req.user.id` or Bearer token header.
- `logout(req, res)` -> Extracts Bearer token, invokes `jwtService.logout(token)`, returns `200`.

---

### 8. `test/run-tests.ts` — Automated Verification Test Suite

Contains 10 automated test cases:

```
✓ Test 1: Register User with Valid Data
✓ Test 2: Duplicate Registration Rejection
✓ Test 3: Input Validation Rules (Invalid Email & Short Password)
✓ Test 4: Successful User Login
✓ Test 5: Login Failure Obfuscation (Wrong Password / User)
✓ Test 6: Middleware Verification with Valid Token
✓ Test 7: Invalid Token Rejection in Middleware
✓ Test 8: Expired Token Rejection in Middleware
✓ Test 9: Logout & Token Blacklisting
✓ Test 10: Fetch Profile without Sensitive Fields
```

Executed via `npm test` (`ts-node test/run-tests.ts`).

---

## 🔒 3. Security Highlights & Summary Table

| Security Rule | Implementation Detail | Location |
|---|---|---|
| **Secret Protection** | Throws error if `JWT_SECRET` is missing; no hardcoded defaults in production. | `JwtService.getSecret()`, `authMiddleware` |
| **Password Hashing** | Bcrypt with salt rounds = 10. | `JwtService.register()` |
| **Sensitive Field Filtering** | Destructures & deletes `password` / `__v` before returning data. | `JwtService.register()`, `login()`, `getProfile()` |
| **Account Obfuscation** | Uniform `"Invalid email or password"` error message for all login failures. | `JwtService.login()` |
| **Input Validation** | Rejects invalid email regex, short passwords (<6 chars), missing fields. | `JwtService.register()` |
| **Token Revocation** | Blacklists tokens on logout; middleware blocks blacklisted JWTs with 401. | `BlacklistRepository`, `authMiddleware` |
| **Expiration Guard** | Specific `TokenExpiredError` detection returning clear 401 response. | `authMiddleware` |

---

## 🚀 4. Package Publishing Checklist

To release a new version of `universal-auth-helper`:
1. Bump version in `package.json` (e.g., `1.1.1`).
2. Run automated test suite: `npm test`
3. Build client UI & TypeScript declarations: `npm run build`
4. Inspect package tarball: `npm pack --dry-run`
5. Commit & push to GitHub: `git commit -am "release: v1.1.1" && git push origin main`
6. Publish to NPM registry: `npm publish`
