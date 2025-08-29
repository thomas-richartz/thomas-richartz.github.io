import React, { useState } from "react";
import { ActivityLogIcon, ArrowRightIcon, AvatarIcon, Cross2Icon, IconJarLogoIcon, MoveIcon } from "@radix-ui/react-icons";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
  errorMessage: string;
}

/**
 * LoginForm component for admin authentication
 */
export function LoginForm({ onLogin, onClose, errorMessage }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className={styles.loginContainer}>
      <button onClick={onClose} className={styles.closeButton}>
        <Cross2Icon />
      </button>
      <h2 className={styles.loginTitle}>Admin Access</h2>
      <div className={styles.loginDesc}>Enter your credentials to access the content management system</div>
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
          <span>Login</span>
        </button>
        {/*<div className={styles.loginFooter}>
          <div className={styles.secureNote}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>OAuth login</span>
          </div>
        </div>*/}
      </form>
    </div>
  );
}

// No default export
