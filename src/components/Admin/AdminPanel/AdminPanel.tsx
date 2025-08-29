import React, { useState, useEffect, useCallback, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./AdminPanel.module.css";
import { LoginForm } from "../LoginForm/LoginForm";
import { InterpretationsEditor } from "../InterpretationsEditor/InterpretationsEditor";
import { MusicEditor } from "../MusicEditor/MusicEditor";
import { Settings } from "../Settings/Settings";
import { ImageEditor } from "../ImageEditor/ImageEditor";
import { useToneMusic } from "@/context/ToneMusicContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "../theme.css";
import "../common.css";

enum AdminTab {
  TEXTE = "Texte",
  IMAGES = "Images",
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
  const adminPanelRef = useRef<HTMLDivElement>(null);
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

  // Apply font size from localStorage on mount
  useEffect(() => {
    try {
      const userPrefs = localStorage.getItem("userPrefs");
      if (userPrefs && adminPanelRef.current) {
        const prefs = JSON.parse(userPrefs);
        if (prefs.fontSizeClass) {
          // Remove default font size classes
          adminPanelRef.current.classList.remove("admin-font-small", "admin-font-medium", "admin-font-large");
          // Apply saved font size class
          adminPanelRef.current.classList.add(prefs.fontSizeClass);
        }
      }
    } catch (error) {
      console.error("Error applying font size:", error);
    }
  }, [isAuthenticated]);

  // Render appropriate content for the active tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case AdminTab.TEXTE:
        return <InterpretationsEditor />;
      case AdminTab.IMAGES:
        return <ImageEditor />;
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
    <ThemeProvider>
      <div ref={adminPanelRef} className={`${styles.adminPanel} adminPanel admin-font-medium`}>
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
    </ThemeProvider>
  );
}
