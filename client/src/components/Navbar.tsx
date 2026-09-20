import React from "react";
import { SystemStats } from "../types";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  stats: SystemStats | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ stats, mobileOpen, setMobileOpen }) => {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="logo-icon">⚡</div>
        <div>
          <h1 className="brand-title">Universal Auth Studio</h1>
          <p className="brand-subtitle">Express + MongoDB Unified MVC Auth Engine</p>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-pill">
          <span className={`dot ${stats?.dbConnected ? "green" : "yellow"} pulse`}></span>
          <span>{stats?.dbConnected ? "MongoDB Connected" : "Memory Store Active"}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-label">Active DB Users:</span>
          <span className="metric-val">{stats?.usersCount ?? 0}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-label">Blacklisted Tokens:</span>
          <span className="metric-val">{stats?.blacklistCount ?? 0}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-label">npm Downloads:</span>
          <span className="metric-val" style={{ color: "#38bdf8" }}>
            {stats?.npmDownloads !== undefined ? stats.npmDownloads.toLocaleString() : 0}
          </span>
        </div>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
};
