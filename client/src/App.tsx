import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SdkDocs } from "./components/SdkDocs";
import { ActiveUsersDashboard } from "./components/ActiveUsersDashboard";
import { MainTab, SystemStats } from "./types";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("sdk");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Poll real system stats from server
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.status) {
        setStats(data);
      }
    } catch (err) {
      console.warn("Failed to fetch system stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar stats={stats} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="content-area">
          {activeTab === "sdk" && <SdkDocs />}

          {activeTab === "metrics" && <ActiveUsersDashboard stats={stats} />}
        </main>
      </div>
    </div>
  );
};
