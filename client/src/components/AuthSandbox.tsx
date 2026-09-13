import React, { useState, useEffect } from "react";
import { SubTab } from "../types";
import { LogIn, UserPlus, ShieldCheck, LogOut, CheckCircle, AlertTriangle } from "lucide-react";

interface AuthSandboxProps {
  currentJwtToken: string | null;
  setCurrentJwtToken: (token: string | null) => void;
  fetchStats: () => void;
  logApi: (method: string, url: string, status: number, data: any, durationMs: number) => void;
}

export const AuthSandbox: React.FC<AuthSandboxProps> = ({
  currentJwtToken,
  setCurrentJwtToken,
  fetchStats,
  logApi,
}) => {
  const [subTab, setSubTab] = useState<SubTab>("jwt");

  // JWT Form States
  const [regName, setRegName] = useState("Roshni Singh");
  const [regEmail, setRegEmail] = useState("roshni@example.com");
  const [regPassword, setRegPassword] = useState("password123");

  const [loginEmail, setLoginEmail] = useState("roshni@example.com");
  const [loginPassword, setLoginPassword] = useState("password123");

  const [decodedPayload, setDecodedPayload] = useState<any>({
    status: "Waiting for login...",
  });

  // Session Form States
  const [sessName, setSessName] = useState("Roshni (Session User)");
  const [sessEmail, setSessEmail] = useState("session.user@example.com");
  const [sessionOutput, setSessionOutput] = useState<any>({
    sessionStatus: "Not authenticated",
  });

  // OAuth Feedback State
  const [oauthResult, setOauthResult] = useState<{
    type: "success" | "error";
    provider?: string;
    email?: string;
    name?: string;
    message?: string;
  } | null>(null);

  // Check OAuth Redirect params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get("oauth");

    if (oauthStatus === "success") {
      setSubTab("oauth");
      setOauthResult({
        type: "success",
        provider: params.get("provider") || "google",
        email: params.get("email") || "user@example.com",
        name: params.get("name") || "Developer",
      });
    } else if (oauthStatus === "error") {
      setSubTab("oauth");
      setOauthResult({
        type: "error",
        provider: params.get("provider") || "OAuth",
        message: params.get("message") || "OAuth Authentication Failed",
      });
    }
  }, []);

  // Decode JWT payload on token change
  useEffect(() => {
    if (currentJwtToken) {
      try {
        const parts = currentJwtToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setDecodedPayload(payload);
        }
      } catch (e) {
        setDecodedPayload({ error: "Failed to parse JWT payload" });
      }
    } else {
      setDecodedPayload({ status: "No active token. Log in above." });
    }
  }, [currentJwtToken]);

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = Date.now();
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      logApi("POST", "/register", res.status, data, Date.now() - start);

      if (res.ok && data.status) {
        alert("🎉 Registration successful! You can now log in.");
        fetchStats();
      } else {
        alert("Registration Error: " + (data.error || data.message || "Failed"));
      }
    } catch (err: any) {
      logApi("POST", "/register", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = Date.now();
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      logApi("POST", "/login", res.status, data, Date.now() - start);

      if (res.ok && data.token) {
        setCurrentJwtToken(data.token);
        localStorage.setItem("universal_auth_token", data.token);
        alert("✅ Login successful! JWT Token saved and ready.");
      } else {
        alert("Login Error: " + (data.error || "Invalid credentials"));
      }
    } catch (err: any) {
      logApi("POST", "/login", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Fetch Protected Profile
  const handleGetProfile = async () => {
    if (!currentJwtToken) {
      alert("Please login first to obtain a JWT token!");
      return;
    }
    const start = Date.now();
    try {
      const res = await fetch("/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${currentJwtToken}` },
      });
      const data = await res.json();
      logApi("GET", "/profile", res.status, data, Date.now() - start);
      setDecodedPayload(data);
    } catch (err: any) {
      logApi("GET", "/profile", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Logout & Blacklist Token
  const handleLogout = async () => {
    if (!currentJwtToken) return;
    const start = Date.now();
    try {
      const res = await fetch("/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentJwtToken}` },
      });
      const data = await res.json();
      logApi("POST", "/logout", res.status, data, Date.now() - start);

      setCurrentJwtToken(null);
      localStorage.removeItem("universal_auth_token");
      setDecodedPayload({ status: "Token revoked and blacklisted" });
      fetchStats();
      alert("🚫 Logged out. Active JWT token has been blacklisted!");
    } catch (err: any) {
      logApi("POST", "/logout", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Session Login
  const handleSessionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = Date.now();
    try {
      const res = await fetch("/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessName, email: sessEmail }),
      });
      const data = await res.json();
      logApi("POST", "/session/login", res.status, data, Date.now() - start);
      setSessionOutput(data);
    } catch (err: any) {
      logApi("POST", "/session/login", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Session Profile
  const handleSessionProfile = async () => {
    const start = Date.now();
    try {
      const res = await fetch("/session/profile");
      const data = await res.json();
      logApi("GET", "/session/profile", res.status, data, Date.now() - start);
      setSessionOutput(data);
    } catch (err: any) {
      logApi("GET", "/session/profile", 500, { error: err.message }, Date.now() - start);
    }
  };

  // Session Logout
  const handleSessionLogout = async () => {
    const start = Date.now();
    try {
      const res = await fetch("/session/logout", { method: "POST" });
      const data = await res.json();
      logApi("POST", "/session/logout", res.status, data, Date.now() - start);
      setSessionOutput(data);
    } catch (err: any) {
      logApi("POST", "/session/logout", 500, { error: err.message }, Date.now() - start);
    }
  };

  return (
    <div>
      {/* Sub Navigation Bar */}
      <div className="sub-nav">
        <button
          className={`sub-btn ${subTab === "jwt" ? "active" : ""}`}
          onClick={() => setSubTab("jwt")}
        >
          JWT Bearer Auth
        </button>
        <button
          className={`sub-btn ${subTab === "session" ? "active" : ""}`}
          onClick={() => setSubTab("session")}
        >
          Session Cookies
        </button>
        <button
          className={`sub-btn ${subTab === "oauth" ? "active" : ""}`}
          onClick={() => setSubTab("oauth")}
        >
          OAuth2 Social Login
        </button>
      </div>

      {/* 1. JWT SUB-PANE */}
      {subTab === "jwt" && (
        <div className="grid-2col">
          <div className="panel-column">
            {/* Register Box */}
            <div className="glass-card">
              <div className="card-header">
                <h3>1. Register Account</h3>
                <span className="badge post">POST /register</span>
              </div>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} /> Create Account
                </button>
              </form>
            </div>

            {/* Login Box */}
            <div className="glass-card">
              <div className="card-header">
                <h3>2. Login & Issue JWT</h3>
                <span className="badge post">POST /login</span>
              </div>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-emerald">
                  <LogIn size={16} /> Login & Obtain Token
                </button>
              </form>
            </div>

            {/* Protected Actions Box */}
            <div className="glass-card">
              <div className="card-header">
                <h3>3. Protected Route & Logout</h3>
                <span className="badge get">GET /profile</span>
              </div>
              <div className="action-row">
                <button onClick={handleGetProfile} className="btn btn-secondary">
                  <ShieldCheck size={16} /> Fetch Profile
                </button>
                <button onClick={handleLogout} className="btn btn-danger">
                  <LogOut size={16} /> Logout (Blacklist)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Token & Decoded Payload Box */}
          <div className="panel-column">
            <div className="glass-card full-height">
              <div className="card-header">
                <h3>Active Token & Decoded Claims</h3>
                <span
                  className={`badge ${currentJwtToken ? "emerald" : "post"}`}
                >
                  {currentJwtToken ? "Active Token Attached" : "No Token Active"}
                </span>
              </div>

              <div className="token-display-container" style={{ marginBottom: "16px" }}>
                <label className="small-label">RAW JWT TOKEN</label>
                <div className="code-box token-box">
                  {currentJwtToken || (
                    <span className="placeholder-text">
                      Log in to generate a JWT Bearer token...
                    </span>
                  )}
                </div>
              </div>

              <div className="token-details">
                <label className="small-label">DECODED PAYLOAD</label>
                <pre className="code-box json-box">
                  {JSON.stringify(decodedPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SESSION COOKIES SUB-PANE */}
      {subTab === "session" && (
        <div className="grid-2col">
          <div className="panel-column">
            <div className="glass-card">
              <div className="card-header">
                <h3>Session Cookie Authentication</h3>
                <span className="badge post">POST /session/login</span>
              </div>
              <form onSubmit={handleSessionLogin}>
                <div className="form-group">
                  <label>Username / Display Name</label>
                  <input
                    type="text"
                    value={sessName}
                    onChange={(e) => setSessName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={sessEmail}
                    onChange={(e) => setSessEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Start Express Session
                </button>
              </form>
            </div>

            <div className="glass-card">
              <div className="card-header">
                <h3>Session Actions</h3>
              </div>
              <div className="action-row">
                <button onClick={handleSessionProfile} className="btn btn-secondary">
                  Check Session (/session/profile)
                </button>
                <button onClick={handleSessionLogout} className="btn btn-danger">
                  Destroy Session (/session/logout)
                </button>
              </div>
            </div>
          </div>

          <div className="panel-column">
            <div className="glass-card full-height">
              <div className="card-header">
                <h3>HTTP Cookie Inspector</h3>
                <span className="badge info">connect.sid Cookie</span>
              </div>
              <p className="card-desc">
                Session authentication sets an HTTP-Only, secure <code>connect.sid</code> cookie
                backed by MongoStore / MemoryStore.
              </p>
              <pre className="code-box json-box">
                {JSON.stringify(sessionOutput, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. OAUTH2 SOCIAL AUTH SUB-PANE */}
      {subTab === "oauth" && (
        <div className="glass-card">
          <div className="card-header">
            <h3>OAuth2 & Passport Integration</h3>
            <span className="badge get">GET /auth/:provider</span>
          </div>
          <p className="card-desc">
            UniversalAuth provides unified Passport.js strategies for Google, GitHub, and
            zero-config instant simulation mode.
          </p>

          <div className="oauth-buttons-grid">
            <a href="/auth/google" className="oauth-btn google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v3.8h5.35c-.23 1.25-.94 2.31-2 3.03v2.52h3.24c1.9-1.75 2.99-4.33 2.99-7.4 0-.53-.05-1.05-.15-1.55z"
                />
                <path
                  fill="currentColor"
                  d="M12 21c2.7 0 4.96-.89 6.62-2.42l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6C4.72 18.76 8.1 21 12 21z"
                />
                <path
                  fill="currentColor"
                  d="M6.41 12.86c-.2-.6-.31-1.24-.31-1.86s.11-1.26.31-1.86V6.54H3.07C2.39 7.89 2 9.4 2 11s.39 3.11 1.07 4.46l3.34-2.6z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.35 14.7 1.5 12 1.5 8.1 1.5 4.72 3.74 3.07 7.04l3.34 2.56c.79-2.36 2.99-4.22 5.59-4.22z"
                />
              </svg>
              Sign in with Google
            </a>

            <a href="/auth/mock?provider=github" className="oauth-btn github">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
                />
              </svg>
              Sign in with GitHub
            </a>

            <a href="/auth/mock?provider=google" className="oauth-btn mock">
              ⚡ Simulate OAuth (Instant Dev Mode)
            </a>
          </div>

          {/* Dynamic OAuth Result Card */}
          {oauthResult && oauthResult.type === "success" && (
            <div
              className="oauth-user-result"
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <h4
                style={{
                  color: "var(--emerald)",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle size={18} /> OAuth Authentication Successful!
              </h4>
              <pre className="code-box json-box">
                {JSON.stringify(
                  {
                    status: "success",
                    provider: oauthResult.provider,
                    email: oauthResult.email,
                    name: oauthResult.name,
                    authenticatedAt: new Date().toISOString(),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {oauthResult && oauthResult.type === "error" && (
            <div
              className="oauth-user-result"
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
              }}
            >
              <h4
                style={{
                  color: "var(--rose)",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle size={18} /> OAuth Setup Notice ({oauthResult.provider})
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                {oauthResult.message}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                👉 Tip: Click <strong>"Simulate OAuth (Instant Dev Mode)"</strong> above for zero-setup local dev testing!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
