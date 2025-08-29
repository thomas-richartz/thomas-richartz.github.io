import React, { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useTheme } from "@/context/ThemeContext";
import { themes } from "../themes";

interface UserPreferences {
  fontSize: string;
  adminTheme: string;
  fontSizeClass: string;
}

/**
 * Settings component for the admin panel
 * Allows users to customize their admin experience
 */
export function Settings() {
  const { currentTheme, setTheme } = useTheme();
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    fontSize: "medium",
    fontSizeClass: "admin-font-medium",
    adminTheme: currentTheme.id,
  });

  // Load user preferences from localStorage on component mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("userPrefs");
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setUserPrefs((prev) => ({
          ...prev,
          ...parsedPrefs,
        }));
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    try {
      const updatedPrefs = { ...userPrefs, ...newPrefs };
      setUserPrefs(updatedPrefs);
      localStorage.setItem("userPrefs", JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = event.target.value;
    setTheme(themeId);
    savePreferences({ adminTheme: themeId });
  };

  // Handle font size change
  const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const fontSize = event.target.value;
    const fontSizeClass = `admin-font-${fontSize}`;

    // Apply font size class to admin panel
    const adminPanel = document.querySelector(".adminPanel");
    if (adminPanel) {
      // Remove existing font size classes
      adminPanel.classList.remove("admin-font-small", "admin-font-medium", "admin-font-large");
      // Add new font size class
      adminPanel.classList.add(fontSizeClass);
    }

    savePreferences({ fontSize, fontSizeClass });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Settings</h3>
      <p className={styles.description}>Customize your admin experience</p>

      <div className={styles.settingsPlaceholder}>
        <div className={styles.settingGroup}>
          <h4 className={styles.groupHeading}>Theme Settings</h4>
          <p className={styles.settingDescription}>Customize the appearance of your admin panel</p>
          <div className={styles.settingContent}>
            <div className={styles.settingTitle}>Color Schemes</div>
            <div className={styles.themeSelector}>
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`${styles.themeSwatch} ${styles[`${theme.id.replace(/-/g, "")}Theme`]} ${userPrefs.adminTheme === theme.id ? styles.selected : ""}`}
                  onClick={() => {
                    setTheme(theme.id);
                    savePreferences({ adminTheme: theme.id });
                  }}
                  title={theme.name}
                >
                  <div className={styles.themeSwatchLabel}>{theme.name}</div>
                </div>
              ))}
            </div>
            <div className={styles.settingTitle} style={{ marginTop: "1rem" }}>
              Font Size
            </div>
            <p className={styles.settingDescription}>Change the text size in the admin panel</p>
            <div className={styles.settingOption}>
              <select className={styles.settingControl} value={userPrefs.fontSize} onChange={handleFontSizeChange}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.settingGroup}>
          <h4 className={styles.groupHeading}>User Permissions</h4>
          <div className={styles.settingContent}>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Edit Content</span>
              <input type="checkbox" className={styles.settingControl} disabled checked />
            </div>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Publish Content</span>
              <input type="checkbox" className={styles.settingControl} disabled checked />
            </div>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Manage Users</span>
              <input type="checkbox" className={styles.settingControl} disabled />
            </div>
          </div>
        </div>

        <div className={styles.settingGroup}>
          <h4 className={styles.groupHeading}>Content Configuration</h4>
          <div className={styles.settingContent}>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Enable Markdown</span>
              <input type="checkbox" className={styles.settingControl} disabled checked />
            </div>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Default View</span>
              <select className={styles.settingControl} disabled>
                <option>Grid</option>
                <option>List</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonBar}>
        <button
          className={styles.button}
          onClick={() => {
            // Reset to default settings
            const defaultPrefs = {
              adminTheme: "neutral-dark",
              fontSize: "medium",
              fontSizeClass: "admin-font-medium",
            };
            setTheme(defaultPrefs.adminTheme);

            // Reset font size class
            const adminPanel = document.querySelector(".adminPanel");
            if (adminPanel) {
              adminPanel.classList.remove("admin-font-small", "admin-font-medium", "admin-font-large", "admin-compact");
              adminPanel.classList.add("admin-font-medium");
            }

            savePreferences(defaultPrefs);
          }}
        >
          Reset to Default Theme
        </button>
      </div>
    </div>
  );
}

// No default export
