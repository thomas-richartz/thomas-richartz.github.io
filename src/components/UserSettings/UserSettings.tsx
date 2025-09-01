import React, { useState } from "react";
import { Cross2Icon, PersonIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import styles from "./UserSettings.module.css";
import { Screen } from "@/enums";
import { useDisplayPreferences } from "@/context/DisplayPreferencesContext";

interface UserSettingsProps {
  onClose: () => void;
  onNavigateToLogin: () => void;
}

/**
 * InfoTooltip component for displaying tooltips
 */
interface InfoTooltipProps {
  text: string;
}

function InfoTooltip({ text }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    // Clear any existing timeout to prevent multiple triggers
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    // Set a new timeout with 600ms delay before showing tooltip
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 600);
    setHoverTimeout(timeout);
  };

  const hideTooltip = () => {
    // Clear any pending show timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsVisible(false);
  };

  // Clean up timeout on component unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className={styles.tooltipContainer}>
      <button
        className={styles.infoIconButton}
        aria-label={isVisible ? "Hide information" : "Show information"}
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <InfoCircledIcon />
      </button>
      {isVisible && (
        <div className={styles.tooltip} role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
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
            <div className={styles.settingLabelContainer}>
              <div className={styles.settingLabel}>Resolution</div>
              <InfoTooltip text="Choose high resolution for best quality or low resolution for better performance" />
            </div>
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
            <div className={styles.settingLabelContainer}>
              <span className={styles.settingLabel}>Fullscreen Mode</span>
              <InfoTooltip text="View the gallery in fullscreen mode for an immersive experience" />
            </div>
            <label className={styles.switch}>
              <input type="checkbox" checked={fullscreen} onChange={handleFullscreenToggle} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.settingContainer}>
          <div className={styles.settingOption}>
            <div className={styles.settingLabelContainer}>
              <div className={styles.settingLabel}>Admin Access</div>
              <InfoTooltip text="Access admin features with login credentials" />
            </div>
            <button className={`${styles.button} ${styles.loginButton}`} onClick={onNavigateToLogin}>
              <PersonIcon style={{ marginRight: "8px" }} />
              <span>Login</span>
            </button>
          </div>
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
