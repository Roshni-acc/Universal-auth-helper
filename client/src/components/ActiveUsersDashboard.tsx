import React from "react";
import { SystemStats } from "../types";
import { Users, Download, Ban, Database, Activity } from "lucide-react";

interface ActiveUsersDashboardProps {
  stats: SystemStats | null;
}

export const ActiveUsersDashboard: React.FC<ActiveUsersDashboardProps> = ({ stats }) => {
  const uptimeMinutes = Math.floor((stats?.uptimeSeconds || 0) / 60);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="glass-card">
        <div className="card-header">
          <h3>Active Users & Package Telemetry Metrics</h3>
          <span className="badge emerald">Live Real-Time Data</span>
        </div>
        <p className="card-desc">
          Real-time metrics monitoring active authenticated application users, official npm registry package downloads, and database engine connection state.
        </p>

        {/* Hero Grid Metrics */}
        <div className="security-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: "16px" }}>
          
          {/* Active Users */}
          <div className="security-card pass" style={{ borderLeftColor: "var(--primary)" }}>
            <div className="sec-icon">
              <Users size={28} color="var(--primary)" />
            </div>
            <div className="sec-info">
              <span className="small-label">ACTIVE DB USERS</span>
              <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                {stats?.usersCount ?? 0}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Registered users in database</p>
            </div>
          </div>

          {/* npm Downloads */}
          <div className="security-card pass" style={{ borderLeftColor: "var(--cyan)" }}>
            <div className="sec-icon">
              <Download size={28} color="var(--cyan)" />
            </div>
            <div className="sec-info">
              <span className="small-label">NPM PACKAGE INSTALLS</span>
              <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--cyan)" }}>
                {stats?.npmDownloads !== undefined ? stats.npmDownloads.toLocaleString() : 0}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Official npm registry downloads</p>
            </div>
          </div>

          {/* Blacklisted Tokens */}
          <div className="security-card pass" style={{ borderLeftColor: "var(--amber)" }}>
            <div className="sec-icon">
              <Ban size={28} color="var(--amber)" />
            </div>
            <div className="sec-info">
              <span className="small-label">REVOKED TOKENS</span>
              <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--amber)" }}>
                {stats?.blacklistCount ?? 0}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Blacklisted JWT tokens in store</p>
            </div>
          </div>

          {/* DB Engine Status */}
          <div className="security-card pass" style={{ borderLeftColor: stats?.dbConnected ? "var(--emerald)" : "var(--amber)" }}>
            <div className="sec-icon">
              <Database size={28} color={stats?.dbConnected ? "var(--emerald)" : "var(--amber)"} />
            </div>
            <div className="sec-info">
              <span className="small-label">DATABASE ENGINE</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: stats?.dbConnected ? "var(--emerald)" : "var(--amber)", marginTop: "4px" }}>
                {stats?.dbConnected ? "MongoDB Atlas" : "Memory Store"}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {stats?.dbConnected ? "Connected & Synchronized" : "Resilient Fallback Mode Active"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* System Health Card */}
      <div className="glass-card">
        <div className="card-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={20} color="var(--emerald)" /> Server Uptime & Engine Status
          </h3>
          <span className="badge get">Active</span>
        </div>

        <div className="grid-2col">
          <div>
            <label className="small-label">ENVIRONMENT</label>
            <div className="code-box" style={{ fontSize: "14px", fontWeight: 600 }}>
              {stats?.environment || "development"}
            </div>
          </div>
          <div>
            <label className="small-label">SERVER UPTIME</label>
            <div className="code-box" style={{ fontSize: "14px", fontWeight: 600, color: "var(--emerald)" }}>
              {uptimeMinutes} minute(s) ({stats?.uptimeSeconds || 0} seconds)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
