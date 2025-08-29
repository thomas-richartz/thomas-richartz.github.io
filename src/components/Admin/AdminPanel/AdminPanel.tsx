import React, { useState, useEffect, useCallback } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./AdminPanel.module.css";
import { LoginForm } from "../LoginForm/LoginForm";
import { InterpretationsEditor } from "../InterpretationsEditor/InterpretationsEditor";
import { MusicEditor } from "../MusicEditor/MusicEditor";
import { Settings } from "../Settings/Settings";
import { useToneMusic } from "@/context/ToneMusicContext";

enum AdminTab {
  TEXTE = "Texte",
  MUSIC = "Music",
  SETTINGS = "Settings",
}

interface AdminPanelProps {
  onClose: () => void;
}

/**
 * Main AdminPanel component
 * Manages authentication and tab navigation between different admin sections
 */
export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.TEXTE);
  const [errorMessage, setErrorMessage] = useState("");
  const { isPlaying, togglePlay } = useToneMusic();

  // Handle login attempt
  const handleLogin = useCallback((username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid credentials");
    }
  }, []);

  // Clean up when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (isPlaying) {
        togglePlay().catch((err) => console.error("Error stopping playback:", err));
      }
    };
  }, [activeTab, isPlaying, togglePlay]);

  // Render appropriate content for the active tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case AdminTab.TEXTE:
        return <InterpretationsEditor />;
      case AdminTab.MUSIC:
        return <MusicEditor />;
      case AdminTab.SETTINGS:
        return <Settings />;
      default:
        return null;
    }
  }, [activeTab]);

  // If not authenticated, render login form with animated background
  if (!isAuthenticated) {
    return (
      <div className={styles.adminPanelLanding}>
        <div className={styles.bgAnimation}>
          <div className={styles.bgGradient}></div>
          <div className={styles.bgMesh}></div>
        </div>
        <LoginForm onLogin={handleLogin} onClose={onClose} errorMessage={errorMessage} />
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <div className={styles.bgAnimation}>
        <div className={styles.bgGradient}></div>
        <div className={styles.bgMesh}></div>
      </div>
      <div className={styles.header}>
        <h2>Admin Panel</h2>
        <div className={styles.adminSubtitle}>Content Management System</div>
        <button onClick={onClose} className={styles.closeButton}>
          <Cross2Icon />
        </button>
      </div>

      <div className={styles.tabs}>
        {Object.values(AdminTab).map((tab) => (
          <button key={tab} className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tabContentContainer}>{renderTabContent()}</div>
    </div>
  );
}
