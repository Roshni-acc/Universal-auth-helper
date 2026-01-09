# Deployment Guide - Universal Auth Helper

Deploy your backend for **FREE** using [Render.com](https://render.com) and [MongoDB Atlas](https://mongodb.com/atlas).

---

## Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and sign up
2. Create a **FREE** M0 cluster
3. Create a database user (save username/password)
4. Whitelist IP `0.0.0.0/0` (allow from anywhere)
5. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/universal_auth?retryWrites=true&w=majority
   ```

---

## Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 3: Deploy to Render.com (Free)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New** → **Web Service**
3. Select your `Universal-auth-helper` repository
4. Configure:
   - **Name**: `universal-auth-helper`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long random string |
   | `SESSION_SECRET` | A long random string |
   | `GOOGLE_CLIENT_ID` | (Optional) Your Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | (Optional) Your Google OAuth secret |

6. Click **Create Web Service**

---

## Step 4: Test Your Deployment

Once deployed, Render will give you a URL like:
```
https://universal-auth-helper.onrender.com
```

Test it:
```bash
# Health check
curl https://universal-auth-helper.onrender.com/

# Register a user
curl -X POST https://universal-auth-helper.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST https://universal-auth-helper.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Notes

- **Free tier** may sleep after 15 minutes of inactivity (first request takes ~30s to wake up)
- For OAuth2 (Google), update your callback URL in Google Console to:
  ```
  https://your-app-name.onrender.com/auth/google/callback
  ```

🎉 **Congratulations!** Your auth helper is now live!
