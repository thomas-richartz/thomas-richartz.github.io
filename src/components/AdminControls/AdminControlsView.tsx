import React, { useState, useEffect, useCallback } from "react";
import styles from "./AdminControlsView.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { InterpretationsPageScreen } from "@/screens/IntepretationsPageScreen";
// import { CollectionPageScreen } from "@/screens/CollectionPageScreen";
import ToneMusicOverlay from "@/components/ToneMusicSystemOverlay";
import { useToneMusic } from "@/context/ToneMusicContext";

// Login component separated to avoid conditional hooks
const LoginForm = ({
  onLogin,
  onClose,
  errorMessage,
}: {
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
  errorMessage: string;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className={styles.adminControls}>
      <div className={styles.loginContainer}>
        <button onClick={onClose} className={styles.closeButton}>
          <Cross2Icon />
        </button>
        <h2>Admin Access</h2>
        <div className={styles.loginDesc}>Enter credentials to access administration panel</div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Music tab content as a separate component
const MusicTabContent = () => {
  const { isPlaying, togglePlay } = useToneMusic();

  const handleChange = useCallback(
    (blocks: any, idx: any, param: any) => {
      if (param === "close" && isPlaying) {
        togglePlay().catch((err: any) => console.error("Error stopping playback:", err));
      }
    },
    [isPlaying, togglePlay],
  );

  return (
    <div className={`${styles.tabContent} ${styles.musicTabContent}`}>
      <ToneMusicOverlay initialBlocks={[]} title="Audio Block Editor" onChange={handleChange} />
    </div>
  );
};

// Settings tab content as a separate component
const SettingsTabContent = () => (
  <div className={styles.tabContent}>
    <h3>Settings</h3>
    <p>Content management settings will be implemented soon</p>
    <div className={styles.settingsPlaceholder}>
      <span className={styles.settingOption}>Theme Settings</span>
      <span className={styles.settingOption}>User Permissions</span>
      <span className={styles.settingOption}>Content Configuration</span>
    </div>
  </div>
);

enum AdminTab {
  TEXTE = "Texte",
  MUSIC = "Music",
  SETTINGS = "Settings",
}

interface AdminControlsViewProps {
  onClose: () => void;
}

// Main Admin Controls component
export const AdminControlsView: React.FC<AdminControlsViewProps> = ({ onClose }) => {
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
        return <InterpretationsPageScreen />;
      case AdminTab.MUSIC:
        return <MusicTabContent />;
      case AdminTab.SETTINGS:
        return <SettingsTabContent />;
      default:
        return null;
    }
  }, [activeTab]);

  // If not authenticated, render login form
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onClose={onClose} errorMessage={errorMessage} />;
  }

  return (
    <div className={styles.adminControls}>
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
};
