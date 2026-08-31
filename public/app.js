// Universal Auth Studio - Interactive App Logic

document.addEventListener("DOMContentLoaded", () => {
  let currentJwtToken = localStorage.getItem("universal_auth_token") || null;

  // Initialize UI components
  initTabs();
  initSubTabs();
  initFormListeners();
  checkOAuthRedirect();
  fetchSystemStats();
  
  if (currentJwtToken) {
    updateTokenDisplay(currentJwtToken);
  }

  // Poll system health & metrics every 10 seconds
  setInterval(fetchSystemStats, 10000);

  // 1. Navigation Tab Switches
  function initTabs() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");

        navButtons.forEach(b => b.classList.remove("active"));
        tabPanes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(`tab-${targetTab}`).classList.add("active");
      });
    });
  }

  // 2. Sub-tab Switches in Sandbox
  function initSubTabs() {
    const subButtons = document.querySelectorAll(".sub-btn");
    const subPanes = document.querySelectorAll(".sub-pane");

    subButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetSub = btn.getAttribute("data-sub");

        subButtons.forEach(b => b.classList.remove("active"));
        subPanes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(`sub-${targetSub}`).classList.add("active");
      });
    });
  }

  // 3. API & Console Logging Utility
  function logApi(method, url, status, data, durationMs) {
    const consoleLogs = document.getElementById("console-logs");
    const timeStr = new Date().toLocaleTimeString();

    const isSuccess = status >= 200 && status < 300;
    const statusClass = isSuccess ? "success" : "error";

    const entry = document.createElement("div");
    entry.className = `log-entry ${statusClass}`;
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <strong>${method} ${url}</strong>
      <span>${status} ${isSuccess ? "OK" : "Error"} (${durationMs}ms)</span>
    `;

    consoleLogs.appendChild(entry);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  document.getElementById("btn-clear-console").addEventListener("click", () => {
    document.getElementById("console-logs").innerHTML = `
      <div class="log-entry info">
        <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
        <span class="log-msg">⚡ API Console cleared.</span>
      </div>
    `;
  });

  // 4. Fetch System Metrics & MongoDB Status
  async function fetchSystemStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();

      if (data.status) {
        document.getElementById("stat-users").textContent = data.usersCount || 0;
        document.getElementById("stat-blacklist").textContent = data.blacklistCount || 0;

        const dbPill = document.getElementById("db-status-pill");
        const dbText = document.getElementById("db-status-text");

        if (data.dbConnected) {
          dbPill.querySelector(".dot").className = "dot green pulse";
          dbText.textContent = "MongoDB Connected";
        } else {
          dbPill.querySelector(".dot").className = "dot yellow pulse";
          dbText.textContent = "Memory Store Active";
        }
      }
    } catch (e) {
      console.warn("Stats update warning:", e);
    }
  }

  // 5. JWT Authentication Forms & Handlers
  function initFormListeners() {
    
    // Register Form
    document.getElementById("form-register").addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = Date.now();
      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;

      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        logApi("POST", "/register", res.status, data, Date.now() - start);

        if (res.ok && data.status) {
          alert("🎉 Registration successful! You can now log in.");
          fetchSystemStats();
        } else {
          alert("Registration Error: " + (data.error || data.message || "Failed"));
        }
      } catch (err) {
        logApi("POST", "/register", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Login Form
    document.getElementById("form-login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = Date.now();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        logApi("POST", "/login", res.status, data, Date.now() - start);

        if (res.ok && data.token) {
          currentJwtToken = data.token;
          localStorage.setItem("universal_auth_token", currentJwtToken);
          updateTokenDisplay(currentJwtToken);
          alert("✅ Login successful! JWT Token saved and attached to authorization headers.");
        } else {
          alert("Login Error: " + (data.error || "Invalid credentials"));
        }
      } catch (err) {
        logApi("POST", "/login", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Fetch Protected Profile
    document.getElementById("btn-get-profile").addEventListener("click", async () => {
      if (!currentJwtToken) {
        alert("Please login first to obtain a JWT token!");
        return;
      }
      const start = Date.now();
      try {
        const res = await fetch("/profile", {
          method: "GET",
          headers: { "Authorization": `Bearer ${currentJwtToken}` }
        });
        const data = await res.json();
        logApi("GET", "/profile", res.status, data, Date.now() - start);

        if (res.ok) {
          document.getElementById("decoded-payload-box").textContent = JSON.stringify(data, null, 2);
        } else {
          document.getElementById("decoded-payload-box").textContent = JSON.stringify(data, null, 2);
          alert("Profile Access Denied: " + (data.message || data.error));
        }
      } catch (err) {
        logApi("GET", "/profile", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Logout & Blacklist Token
    document.getElementById("btn-logout").addEventListener("click", async () => {
      if (!currentJwtToken) return;
      const start = Date.now();
      try {
        const res = await fetch("/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${currentJwtToken}` }
        });
        const data = await res.json();
        logApi("POST", "/logout", res.status, data, Date.now() - start);

        currentJwtToken = null;
        localStorage.removeItem("universal_auth_token");
        document.getElementById("raw-token-box").innerHTML = `<span class="placeholder-text">Logged out. Token blacklisted.</span>`;
        document.getElementById("decoded-payload-box").textContent = JSON.stringify({ message: "Token revoked" }, null, 2);
        document.getElementById("jwt-status-badge").className = "badge post";
        document.getElementById("jwt-status-badge").textContent = "Token Revoked";
        fetchSystemStats();
        alert("🚫 Logged out. Token blacklisted!");
      } catch (err) {
        logApi("POST", "/logout", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Session Login
    document.getElementById("form-session-login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = Date.now();
      const name = document.getElementById("sess-username").value;
      const email = document.getElementById("sess-email").value;

      try {
        const res = await fetch("/session/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email })
        });
        const data = await res.json();
        logApi("POST", "/session/login", res.status, data, Date.now() - start);

        document.getElementById("session-output-box").textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        logApi("POST", "/session/login", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Session Profile
    document.getElementById("btn-session-profile").addEventListener("click", async () => {
      const start = Date.now();
      try {
        const res = await fetch("/session/profile");
        const data = await res.json();
        logApi("GET", "/session/profile", res.status, data, Date.now() - start);
        document.getElementById("session-output-box").textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        logApi("GET", "/session/profile", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Session Logout
    document.getElementById("btn-session-logout").addEventListener("click", async () => {
      const start = Date.now();
      try {
        const res = await fetch("/session/logout", { method: "POST" });
        const data = await res.json();
        logApi("POST", "/session/logout", res.status, data, Date.now() - start);
        document.getElementById("session-output-box").textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        logApi("POST", "/session/logout", 500, { error: err.message }, Date.now() - start);
      }
    });

    // Token Inspector Button
    document.getElementById("btn-inspect-token").addEventListener("click", () => {
      const raw = document.getElementById("inspect-token-input").value.trim();
      if (!raw) return alert("Please paste a valid JWT token first!");
      analyzeJwtToken(raw);
    });
  }

  // 6. JWT Decoder & Token UI Updates
  function updateTokenDisplay(token) {
    document.getElementById("raw-token-box").textContent = token;
    document.getElementById("jwt-status-badge").className = "badge emerald";
    document.getElementById("jwt-status-badge").textContent = "Active Token Attached";
    
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        document.getElementById("decoded-payload-box").textContent = JSON.stringify(payload, null, 2);
      }
    } catch (e) {
      document.getElementById("decoded-payload-box").textContent = "Failed to parse JWT payload";
    }
  }

  function analyzeJwtToken(token) {
    const resultsBox = document.getElementById("inspect-results-box");
    const headerBox = document.getElementById("inspect-header");
    const payloadBox = document.getElementById("inspect-payload");
    const statusBar = document.getElementById("inspect-status-bar");

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        alert("Invalid JWT format! A valid JWT must contain 3 parts separated by dots.");
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      headerBox.textContent = JSON.stringify(header, null, 2);
      payloadBox.textContent = JSON.stringify(payload, null, 2);

      const expDate = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "No Expiration";
      const isExpired = payload.exp ? Date.now() > payload.exp * 1000 : false;

      statusBar.innerHTML = `
        <div style="padding: 12px; border-radius: 8px; margin-top: 10px; font-size: 13px; font-weight: 600; background: ${isExpired ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${isExpired ? '#f43f5e' : '#10b981'};">
          ${isExpired ? '❌ TOKEN EXPIRED (Expiry: ' + expDate + ')' : '✅ TOKEN VALID (Expires: ' + expDate + ')'}
        </div>
      `;

      resultsBox.style.display = "block";
    } catch (err) {
      alert("Error analyzing token: " + err.message);
    }
  }

  // 7. OAuth Redirect Check
  function checkOAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("oauth") === "success") {
      const provider = urlParams.get("provider") || "OAuth";
      const email = urlParams.get("email") || "user@example.com";
      
      const subNavOauth = document.querySelector('[data-sub="oauth"]');
      if (subNavOauth) subNavOauth.click();

      const resultCard = document.getElementById("oauth-result-card");
      const userJsonBox = document.getElementById("oauth-user-json");
      resultCard.style.display = "block";
      userJsonBox.textContent = JSON.stringify({
        status: "success",
        provider: provider,
        email: email,
        authenticatedAt: new Date().toISOString()
      }, null, 2);
    }
  }
});
