# Production & Deployment Guide - Universal Auth Helper

Deploy your full-stack Universal Auth Helper (API + Universal Auth Studio UI) for **FREE** using [Render.com](https://render.com) and [MongoDB Atlas](https://mongodb.com/atlas).

---

## 🚀 Key Production Features

1. **Integrated 5-Minute Auto-Ping Keep-Alive**: Includes an automated self-ping heartbeat (`GET /ping`) every 5 minutes so your Render free web service **never goes to sleep**!
2. **Unified Full-Stack Deployment**: The Express server automatically serves the high-performance dark mode Studio UI at `/` out of the box. No separate frontend hosting required!
3. **Resilient Hybrid Database Engine**: Automatically connects to MongoDB Atlas when `MONGO_URI` is provided, with graceful memory-store fallback when Mongo is unavailable.

---

## Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and sign up.
2. Create a **FREE** M0 cluster.
3. Create a database user (save username and password).
4. Whitelist IP `0.0.0.0/0` (allow access from anywhere).
5. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/universal_auth?retryWrites=true&w=majority
   ```

---

## Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Add Universal Auth Studio UI and Render keep-alive auto-ping"
git push origin main
```

---

## Step 3: Deploy to Render.com (Free)

1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **New** → **Web Service**.
3. Select your `Universal-auth-helper` repository.
4. Configure service settings:
   - **Name**: `universal-auth-helper`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `NODE_ENV` | `production` | Enables production cookie flags & performance optimizations |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
   | `JWT_SECRET` | `your_super_secret_jwt_key_2026` | Secret key for signing JWT tokens |
   | `SESSION_SECRET` | `your_super_secret_session_key` | Secret key for express session cookies |
   | `RENDER_EXTERNAL_URL` | `https://universal-auth-helper.onrender.com` | Used by auto-ping worker to prevent sleep |
   | `GOOGLE_CLIENT_ID` | `(Optional)` | Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | `(Optional)` | Google OAuth secret |

6. Click **Create Web Service**.

---

## 🎨 How to Deploy the Frontend UI

### Option A: Unified Single-Service Deployment (RECOMMENDED)
The frontend UI is served **automatically** by the backend at `https://your-app.onrender.com/` from the `public/` directory!
- Zero configuration needed!
- No CORS setup required.
- Both the API and UI run under the same domain.

### Option B: Separate Static Hosting (Vercel / Netlify / GitHub Pages)
If you prefer hosting the frontend separately from the backend:
1. Upload the `public/` directory files (`index.html`, `style.css`, `app.js`) to Vercel or Netlify.
2. In `public/app.js`, update the base API fetch URL from `/register` or `/login` to `https://universal-auth-helper.onrender.com`.
3. Enable CORS in `src/app.ts` using `cors()` middleware allowing your frontend domain.

---

## 📡 Testing Render Keep-Alive & API

Once deployed, visit your Render URL:
- **Auth Studio UI**: `https://universal-auth-helper.onrender.com/`
- **Ping / Keep-Alive Endpoint**: `https://universal-auth-helper.onrender.com/ping`
- **Health Check**: `https://universal-auth-helper.onrender.com/api/health`
- **System Metrics**: `https://universal-auth-helper.onrender.com/api/stats`

🎉 **Congratulations!** Your Universal Auth Helper backend, Studio UI, and 5-minute keep-alive worker are now live!
