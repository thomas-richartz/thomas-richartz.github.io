import React from "react";
import { Cross2Icon, PersonIcon } from "@radix-ui/react-icons";
import styles from "./UserSettings.module.css";
import { Screen } from "@/enums";
import { useDisplayPreferences } from "@/context/DisplayPreferencesContext";

interface UserSettingsProps {
  onClose: () => void;
  onNavigateToLogin: () => void;
}

/**
 * UserSettings component for managing gallery display preferences
 */
export function UserSettings({ onClose, onNavigateToLogin }: UserSettingsProps) {
  // Use the display preferences context
  const { resolution, setResolution, fullscreen, setFullscreen, applyFullscreen, exitFullscreen, fullscreenSource } = useDisplayPreferences();

  // Save preferences and apply settings
  const savePreferences = async () => {
    try {
      // Apply fullscreen if enabled
      if (fullscreen && !document.fullscreenElement) {
        await applyFullscreen("user-settings");
      } else if (!fullscreen && document.fullscreenElement) {
        await exitFullscreen("user-settings");
      }

      // Close settings after saving
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Reset preferences to defaults
  const resetPreferences = async () => {
    setResolution("high");
    setFullscreen(false);

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      await exitFullscreen("user-settings");
    }
  };

  // Handle toggle fullscreen
  const handleFullscreenToggle = () => {
    setFullscreen(!fullscreen, "user-settings");
  };

  return (
    <div className={styles.userSettingsContainer}>
      <button onClick={onClose} className={styles.closeButton}>
        <Cross2Icon />
      </button>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.form}>
        <div className={styles.settingContainer}>
          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>Resolution</div>
            <p className={styles.infoText}>Choose high resolution for best quality or low resolution for better performance</p>
            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input type="radio" id="high-res" name="resolution" checked={resolution === "high"} onChange={() => setResolution("high")} />
                <label htmlFor="high-res">High Quality</label>
              </div>
              <div className={styles.radioOption}>
                <input type="radio" id="low-res" name="resolution" checked={resolution === "low"} onChange={() => setResolution("low")} />
                <label htmlFor="low-res">Low Quality</label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingContainer}>
          <div className={styles.settingOption}>
            <span className={styles.settingLabel}>Fullscreen Mode</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={fullscreen} onChange={handleFullscreenToggle} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <p className={styles.infoText}>View the gallery in fullscreen mode for an immersive experience</p>
        </div>

        <div className={styles.settingContainer}>
          <div className={styles.settingLabel}>Admin Access</div>
          {/*<p className={styles.infoText}></p>*/}
          <button className={styles.button} onClick={onNavigateToLogin}>
            <PersonIcon style={{ marginRight: "8px" }} />
            <span>Go to Login Page</span>
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={resetPreferences}>
            Reset to Default
          </button>
          <button className={`${styles.button} ${styles.primary}`} onClick={savePreferences}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
