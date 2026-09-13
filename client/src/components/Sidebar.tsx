import React from "react";
import { MainTab } from "../types";
import { BookOpen, Users } from "lucide-react";

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const handleTabClick = (tab: MainTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <nav className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="nav-section-title">DOCUMENTATION & METRICS</div>
      
      <button
        className={`nav-btn ${activeTab === "sdk" ? "active" : ""}`}
        onClick={() => handleTabClick("sdk")}
      >
        <BookOpen size={18} /> Package Documentation
      </button>

      <button
        className={`nav-btn ${activeTab === "metrics" ? "active" : ""}`}
        onClick={() => handleTabClick("metrics")}
      >
        <Users size={18} /> Active Users & Telemetry
      </button>

      <div className="sidebar-footer">
        <div className="tech-stack-tags">
          <span className="tech-tag">React 18</span>
          <span className="tech-tag">Express v5</span>
          <span className="tech-tag">MongoDB</span>
          <span className="tech-tag">JWT</span>
          <span className="tech-tag">Passport</span>
        </div>
      </div>
    </nav>
  );
};
