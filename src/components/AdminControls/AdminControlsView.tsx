import React from "react";
import styles from "./AdminControlsView.module.css";
import { AdminPanel } from "@/components/Admin/AdminPanel/AdminPanel";

// All components have been moved to the Admin directory

interface AdminControlsViewProps {
  onClose: () => void;
}

/**
 * Admin Controls component that now uses the refactored Admin components
 */
export const AdminControlsView: React.FC<AdminControlsViewProps> = ({ onClose }) => {
  return (
    <div className={styles.adminControls}>
      <AdminPanel onClose={onClose} />
    </div>
  );
};
