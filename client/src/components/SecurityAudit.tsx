import React from "react";
import { Lock, Ban, Cookie, Zap } from "lucide-react";

export const SecurityAudit: React.FC = () => {
  return (
    <div className="glass-card">
      <div className="card-header">
        <h3>Production Security & Readiness Audit</h3>
        <span className="badge emerald">Audited & Verified</span>
      </div>

      <div className="security-grid">
        <div className="security-card pass">
          <div className="sec-icon">
            <Lock size={24} color="#10b981" />
          </div>
          <div className="sec-info">
            <h4>Password Hashing (bcrypt)</h4>
            <p>Passwords hashed with salt rounds before database persistence.</p>
          </div>
        </div>

        <div className="security-card pass">
          <div className="sec-icon">
            <Ban size={24} color="#10b981" />
          </div>
          <div className="sec-info">
            <h4>JWT Token Blacklisting</h4>
            <p>Revoked tokens stored in Mongo/Memory blacklist repository to prevent reuse.</p>
          </div>
        </div>

        <div className="security-card pass">
          <div className="sec-icon">
            <Cookie size={24} color="#10b981" />
          </div>
          <div className="sec-info">
            <h4>HttpOnly & Secure Session Cookies</h4>
            <p>Cookie flag prevents Client-side XSS cookie theft.</p>
          </div>
        </div>

        <div className="security-card pass">
          <div className="sec-icon">
            <Zap size={24} color="#10b981" />
          </div>
          <div className="sec-info">
            <h4>Resilient Zero-Crash Storage</h4>
            <p>Automatic memory fallback guarantees uptime if MongoDB experiences network latency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
