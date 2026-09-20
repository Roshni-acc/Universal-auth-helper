# Package Publishing & Lifecycle Maintenance Guide

Complete guide for publishing, updating, archiving, and deleting **`universal-auth-helper`** across **NPM**, **Render**, **Netlify**, and **GitHub**.

---

## 📌 Architecture Overview

```
                                  ┌───────────────────────────────┐
                                  │   npm install                 │
                                  │   universal-auth-helper       │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                         📦  NPM Registry
                                       (npmjs.com package)
                                                  ▲
                                                  │ (npm publish)
                                                  │
┌───────────────────────────────┐        ┌────────┴──────────────────────┐
│       Netlify Frontend        │        │        Render Backend         │
│   (React Developer Studio)    │        │         (Express API)         │
│  https://...netlify.app       │        │ https://universal-auth-helper │
└───────────────┬───────────────┘        │         .onrender.com         │
                │                        └───────────────────────────────┘
                │ /api/* proxy                    ▲
                └─────────────────────────────────┘
```

---

## 🚀 Part 1: Publishing to NPM Registry (`npmjs.com`)

### 1. Prerequisites
- An NPM account (sign up at [npmjs.com/signup](https://www.npmjs.com/signup)).
- Email verified on NPM.

### 2. Log in via Terminal
Run the following command in the project root:
```bash
npm login
```
*Enter your NPM username, password, email, and 2FA OTP code when prompted.*

### 3. Run Production Build
Ensure all TypeScript definitions (`dist/`) and React Developer Studio assets (`public/`) are freshly compiled:
```bash
npm run build
```

### 4. Preview Package Tarball (Optional)
Check what files will be included in the published NPM package:
```bash
npm pack --dry-run
```

### 5. Publish to NPM
Execute the publish command:
```bash
npm publish --access public
```

### 6. Verify Live Package
Your package will be available at:
`https://www.npmjs.com/package/universal-auth-helper`

Developers can now install it in their Express applications:
```bash
npm install universal-auth-helper
```

---

## 🔄 Part 2: Releasing Updates Across Platforms

### Live Web Services (Render + Netlify)
Whenever you push code changes to the `main` branch, **Render** and **Netlify** automatically rebuild and deploy:
```bash
git add .
git commit -m "Update authentication features"
git push origin main
```

### NPM Package Release
When releasing a new package version to NPM:
```bash
# 1. Bump version (patch: 1.0.0 -> 1.0.1, minor: 1.0.0 -> 1.1.0, major: 1.0.0 -> 2.0.0)
npm version patch

# 2. Rebuild assets
npm run build

# 3. Publish update to NPM
npm publish
```

---

## 🗑️ Part 3: Archiving & Deleting the Project

If you ever need to archive or delete `universal-auth-helper` from any platform, follow these steps:

### 📦 1. NPM Package (`npmjs.com`)

#### Option A: Deprecate Package (Recommended)
Displays a warning message on npmjs.com and during `npm install`, but keeps existing installations from breaking:
```bash
npm deprecate universal-auth-helper "This package is deprecated and no longer maintained."
```

#### Option B: Completely Unpublish (Delete from NPM)
Unpublishes the package from the registry (allowed within 72 hours of publication if un-depended on):
```bash
npm unpublish universal-auth-helper --force
```

---

### 🌐 2. Render Web Service (Backend API)
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Select **`universal-auth-helper`**.
3. Open **Settings** and scroll to the bottom **Danger Zone**:
   - **To Suspend (Pause server & billing)**: Click **Suspend Web Service**.
   - **To Delete permanently**: Click **Delete Web Service**.

---

### 🎨 3. Netlify Site (Frontend UI)
1. Go to [app.netlify.com](https://app.netlify.com).
2. Select your `universal-auth-helper` site.
3. Navigate to **Site Configuration** → **General** → **Site details**.
4. Scroll to the bottom and click **Delete site**.

---

### 🐙 4. GitHub Repository
1. Open `https://github.com/Roshni-acc/Universal-auth-helper`.
2. Click **Settings**.
3. Scroll down to **Danger Zone**:
   - **To Archive (Read-Only)**: Click **Archive this repository**.
   - **To Delete permanently**: Click **Delete this repository**.
