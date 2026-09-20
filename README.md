# universal-auth-helper

> Unified Express & MongoDB Authentication SDK with Embedded React Developer Studio.

`universal-auth-helper` is an all-in-one authentication helper designed to streamline JWT Bearer authentication, Express session cookies, Passport.js OAuth2 social logins, and token blacklisting for Express and MongoDB applications.

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
UniversalAuth.init(app, {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET
});

// 2. Protect routes with built-in JWT middleware
app.get("/api/dashboard", UniversalAuth.jwtMiddleware(), (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
```

When your server starts, navigate to `http://localhost:5000` to access the embedded **Universal Auth Studio** UI!

---

## 🚀 Features

- **Unified Auth Engine**: Replaces complex boilerplate across multiple packages with a single `UniversalAuth.init(app)` call.
- **JWT Bearer Token System**: Registration, password hashing (bcrypt), login token issuance, profile route protection, and token revocation.
- **Automatic Token Blacklisting**: Blacklists revoked JWT tokens in MongoDB or resilient memory store to prevent replay attacks.
- **Session Cookie Authentication**: HttpOnly session cookie authentication backed by MongoStore or MemoryStore.
- **OAuth2 Social Integration**: Unified Passport strategies for Google, GitHub, and zero-config local simulation mode.
- **Embedded React Developer Studio**: Built-in React 18 UI served directly from your app for live documentation and package telemetry.
- **Resilient Memory Fallback**: Automatically falls back to memory store if MongoDB connection drops, preventing server crashes.

---

## 🔒 Security Assumptions & Limitations

Developers integrating this library should be aware of the following security assumptions and recommendations:

1. **Environment Variables**: Never hardcode or commit `JWT_SECRET`, `MONGO_URI`, or OAuth client secrets to version control. Always use `.env` files managed via `dotenv`.
2. **HTTPS in Production**: Session cookies and Bearer tokens must be transmitted over encrypted HTTPS connections in production (`NODE_ENV=production`).
3. **JWT Secret Strength**: Ensure your `JWT_SECRET` is a strong, cryptographically secure random string (at least 32 characters long).
4. **OAuth Redirect URIs**: Register exact redirect URLs (`/auth/google/callback`) in your Google/GitHub Developer Consoles to prevent open redirect vulnerabilities.
5. **CORS Policy**: Configure `Access-Control-Allow-Origin` headers appropriately for your specific client domains when serving cross-origin APIs.

---

## ⚠️ Disclaimer

> **DISCLAIMER**: This package is provided **"as is"** without warranties of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, or non-infringement. Users and developers are solely responsible for evaluating, testing, and securing their authentication implementation and application environment.

---

## 📄 License

[MIT License](LICENSE) © 2026 Roshni Singh
