# DeploySense AI Integration Guide

> Real-time AI-powered automated error tracking, uncaught exception monitoring, and route crash diagnostics for Node.js and Express applications.

---

## 🚀 Quick Integration

### 1. Zero-Boilerplate SDK Initialization

When initializing `UniversalAuth`, simply configure the `deploySense` options block:

```typescript
import express from "express";
import { UniversalAuth } from "universal-auth-helper";

const app = express();

UniversalAuth.init(app, {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  deploySense: {
    enabled: true, // Enables global uncaught exception listener & telemetry
    serviceName: "my-express-app",
    environment: process.env.NODE_ENV || "development"
  }
});

// Attach DeploySense route error handler after all app routes
app.use(UniversalAuth.deploySenseErrorMiddleware());
```

---

## 💻 Local Development Setup

When testing DeploySense AI locally (with a local DeploySense server running on `http://localhost:4000` or custom port):

### Option A: Via Environment Variables (`.env`)
Add `DEPLOYSENSE_URL` to your `.env` file:
```env
DEPLOYSENSE_URL=http://localhost:4000
SERVICE_NAME=universal-auth-local
NODE_ENV=development
ALERT_EMAIL=developer@example.com
```

### Option B: Direct Configuration in Code
Pass the `url` parameter directly in `initDeploySenseGlobalLogger` or `UniversalAuth.init`:

```typescript
import { initDeploySenseGlobalLogger, deploySenseExpressMiddleware } from "universal-auth-helper";

// 1. Initialize global process error monitors
initDeploySenseGlobalLogger("my-local-app", "development", "http://localhost:4000");

// 2. Attach Express 500 error middleware
app.use(deploySenseExpressMiddleware({ serviceName: "my-local-app", customUrl: "http://localhost:4000" }));
```

---

## 🌐 Production Deployment Setup

When deploying to cloud providers (Render, Railway, AWS, Heroku, Vercel):

### Environment Variables

| Variable | Description | Example / Default |
|----------|-------------|-------------------|
| `DEPLOYSENSE_URL` | Base URL of your DeploySense AI ingest backend server | `https://deploysense-ai.onrender.com` or custom domain |
| `SERVICE_NAME` | Identifier for your microservice or application | `universal-auth-helper` |
| `NODE_ENV` | Environment stage | `production` |
| `ALERT_EMAIL` | Direct recipient email for critical crash notifications | `admin@example.com` |

---

## 🧪 Testing Your Integration

To verify that DeploySense AI is correctly capturing errors:

### 1. Test Express Route Errors
Create a test route that throws an error:
```typescript
app.get("/test-error", (_req, _res) => {
  throw new Error("🧪 Test DeploySense route exception");
});
```
When accessing `/test-error`, DeploySense Express middleware catches the error, sends telemetry to `DEPLOYSENSE_URL`, and responds with HTTP 500.

### 2. Test Global Uncaught Synchronous Exceptions
```typescript
setTimeout(() => {
  throw new Error("🔥 Test uncaught process exception");
}, 1000);
```

### 3. Test Unhandled Async Rejections
```typescript
Promise.reject(new Error("🔥 Test unhandled async promise rejection"));
```

---

## 🛡️ Robust Failure Resilience

If the DeploySense ingest backend becomes unreachable, offline, or returns HTTP 503 (e.g. host suspended or network offline):
- DeploySense middleware captures the failure gracefully without crashing your Express app.
- Concise non-intrusive warnings are printed to terminal console (`⚠️ [DeploySense AI Ingest Warning]...`).
- Zero unhandled promise rejections or raw HTML dumps in application logs.
