import React from "react";
import { Sparkles, CheckCircle2, XCircle, DollarSign, ShieldAlert, FileText } from "lucide-react";

export const SdkDocs: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* 1. WHY THIS PACKAGE DIFFERS */}
      <div className="glass-card">
        <div className="card-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="var(--cyan)" /> Why `universal-auth-helper` Differs From Other npm Packages
          </h3>
          <span className="badge emerald">Unique Selling Proposition</span>
        </div>
        <p className="card-desc">
          Traditional npm authentication packages (like <code>jsonwebtoken</code> or <code>passport</code>) only give you raw functions and require writing hundreds of lines of boilerplate code. <strong>universal-auth-helper</strong> is a complete, unified authentication engine with an embedded Developer Studio UI.
        </p>

        <div className="table-responsive">
          <table className="endpoint-table">
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th>Traditional Auth Packages</th>
                <th style={{ color: "var(--emerald)", fontWeight: 700 }}>universal-auth-helper</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Setup Overhead</strong></td>
                <td><XCircle size={16} color="var(--rose)" /> Complex wiring of 8+ packages</td>
                <td style={{ color: "var(--emerald)" }}><CheckCircle2 size={16} /> <strong>1 Line of Code:</strong> <code>UniversalAuth.init(app)</code></td>
              </tr>
              <tr>
                <td><strong>Interactive Developer Studio</strong></td>
                <td><XCircle size={16} color="var(--rose)" /> None. Requires Postman / Insomnia</td>
                <td style={{ color: "var(--emerald)" }}><CheckCircle2 size={16} /> <strong>Embedded React Studio UI</strong> running in-app</td>
              </tr>
              <tr>
                <td><strong>OAuth2 Social Login</strong></td>
                <td><XCircle size={16} color="var(--rose)" /> Manual session setup & error handling</td>
                <td style={{ color: "var(--emerald)" }}><CheckCircle2 size={16} /> Instant Google, GitHub & zero-config Dev Mock</td>
              </tr>
              <tr>
                <td><strong>JWT Revocation & Blacklist</strong></td>
                <td><XCircle size={16} color="var(--rose)" /> Manual Redis or DB tracking code</td>
                <td style={{ color: "var(--emerald)" }}><CheckCircle2 size={16} /> Built-in automatic Mongo & Memory store blacklist</td>
              </tr>
              <tr>
                <td><strong>Database Resilience</strong></td>
                <td><XCircle size={16} color="var(--rose)" /> Crashes app if Mongo disconnects</td>
                <td style={{ color: "var(--emerald)" }}><CheckCircle2 size={16} /> Resilient Memory Store zero-crash fallback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. QUICK-START GUIDE */}
      <div className="glass-card">
        <div className="card-header">
          <h3>Quick-Start Integration Guide</h3>
          <span className="badge post">Node.js / Express</span>
        </div>

        <h4 style={{ margin: "16px 0 8px 0" }}>1. Installation</h4>
        <pre className="code-box">
          <code>npm install universal-auth-helper express mongoose jsonwebtoken passport</code>
        </pre>

        <h4 style={{ margin: "16px 0 8px 0" }}>2. Express App Setup (3 Lines of Code!)</h4>
        <pre className="code-box">
          <code>{`import express from "express";
import { UniversalAuth } from "universal-auth-helper";

const app = express();

// Initialize Universal Auth (Configures JWT, Sessions, Passport, MongoDB & Studio UI)
UniversalAuth.init(app, {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET
});

// Protect routes with JWT middleware
app.get("/api/dashboard", UniversalAuth.jwtMiddleware(), (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.listen(5000, () => console.log("Server running on port 5000"));`}</code>
        </pre>

        <h4 style={{ margin: "16px 0 8px 0" }}>3. API Endpoints Reference</h4>
        <div className="table-responsive">
          <table className="endpoint-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Auth Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge post">POST</span></td>
                <td><code>/register</code></td>
                <td>Public</td>
                <td>Creates a new user with hashed password (bcrypt)</td>
              </tr>
              <tr>
                <td><span className="badge post">POST</span></td>
                <td><code>/login</code></td>
                <td>Public</td>
                <td>Validates credentials & returns JWT token</td>
              </tr>
              <tr>
                <td><span className="badge get">GET</span></td>
                <td><code>/profile</code></td>
                <td>Bearer Token</td>
                <td>Returns current authenticated user details</td>
              </tr>
              <tr>
                <td><span className="badge post">POST</span></td>
                <td><code>/logout</code></td>
                <td>Bearer Token</td>
                <td>Blacklists active JWT token against future requests</td>
              </tr>
              <tr>
                <td><span className="badge post">POST</span></td>
                <td><code>/session/login</code></td>
                <td>Cookie</td>
                <td>Initializes cookie-based Express session</td>
              </tr>
              <tr>
                <td><span className="badge get">GET</span></td>
                <td><code>/auth/google</code></td>
                <td>OAuth2</td>
                <td>Triggers Google Passport authentication</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SECURITY ASSUMPTIONS & LIMITATIONS */}
      <div className="glass-card">
        <div className="card-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={20} color="var(--amber)" /> Security Assumptions & Best Practices
          </h3>
          <span className="badge info">Guidelines</span>
        </div>
        
        <ul style={{ paddingLeft: "20px", fontSize: "13px", lineHeight: "1.8", color: "var(--text-muted)" }}>
          <li><strong>Environment Variables:</strong> Never hardcode or commit <code>JWT_SECRET</code>, <code>MONGO_URI</code>, or OAuth client secrets to version control. Always manage via <code>.env</code> files.</li>
          <li><strong>HTTPS Transport:</strong> Transmit session cookies and Bearer tokens over HTTPS in production environments (<code>NODE_ENV=production</code>).</li>
          <li><strong>Secret Strength:</strong> Ensure <code>JWT_SECRET</code> is a strong random string (at least 32 characters long).</li>
          <li><strong>OAuth Callback Registration:</strong> Register exact callback URLs (<code>/auth/google/callback</code>) in your OAuth Provider console to prevent redirect exploits.</li>
        </ul>
      </div>

      {/* 4. LEGAL DISCLAIMER */}
      <div className="glass-card" style={{ borderLeft: "4px solid var(--amber)", background: "rgba(245,158,11,0.05)" }}>
        <div className="card-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--amber)" }}>
            <FileText size={20} /> Package Disclaimer
          </h3>
          <span className="badge info">MIT License</span>
        </div>
        <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--text-muted)" }}>
          <strong>DISCLAIMER:</strong> This package is provided <em>"as is"</em> without warranties of any kind, express or implied. Users, developers, and integrators are solely responsible for evaluating, testing, and securing their authentication implementation, server configurations, and deployment environment.
        </p>
      </div>

      {/* 5. ZERO COST PUBLISHING GUIDE */}
      <div className="glass-card">
        <div className="card-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={20} color="var(--emerald)" /> How to Publish to npm for $0 Zero Cost
          </h3>
          <span className="badge emerald">100% Free Open Source</span>
        </div>
        <p className="card-desc">
          Publishing packages on the official npm registry (npmjs.com) is completely free forever.
        </p>

        <ol style={{ paddingLeft: "20px", fontSize: "13px", lineHeight: "1.8", color: "var(--text-muted)" }}>
          <li>Create a free account on <a href="https://www.npmjs.com/signup" target="_blank" rel="noreferrer" style={{ color: "var(--cyan)" }}>npmjs.com</a>.</li>
          <li>In your terminal, log in to your account: <code style={{ background: "#07090e", padding: "2px 6px", borderRadius: "4px", color: "#a7f3d0" }}>npm login</code></li>
          <li>Build the React UI and TypeScript code: <code style={{ background: "#07090e", padding: "2px 6px", borderRadius: "4px", color: "#a7f3d0" }}>npm run build</code></li>
          <li>Publish your package publicly for free: <code style={{ background: "#07090e", padding: "2px 6px", borderRadius: "4px", color: "#a7f3d0" }}>npm publish --access public</code></li>
        </ol>
      </div>

    </div>
  );
};
