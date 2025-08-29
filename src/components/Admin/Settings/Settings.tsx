import React from "react";
import styles from "./Settings.module.css";

/**
 * Settings component for the admin panel
 * Currently a placeholder for future implementation
 */
export function Settings() {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Settings</h3>
      <p className={styles.description}>Content management settings will be implemented soon</p>

      <div className={styles.settingsPlaceholder}>
        <div className={styles.settingGroup}>
          <h4 className={styles.groupHeading}>Theme Settings</h4>
          <div className={styles.settingContent}>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Color Scheme</span>
              <select className={styles.settingControl} disabled>
                <option>Dark</option>
                <option>Light</option>
                <option>System Default</option>
              </select>
            </div>
            <div className={styles.settingOption}>
              <span className={styles.settingLabel}>Font Size</span>
              <select className={styles.settingControl} disabled>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
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
        <button className={styles.button} disabled>
          Save Settings
        </button>
        <button className={styles.button} disabled>
          Reset Defaults
        </button>
      </div>
    </div>
  );
}

// No default export
