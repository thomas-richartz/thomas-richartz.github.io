import React, { useState } from "react";
import { FlowEditor } from "@/components/FlowEditor";
import { RouteConfig } from "@/context/RouterContext";
import { Screen } from "@/enums";
import styles from "./FlowEditorScreen.module.css";

interface FlowEditorScreenProps {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
}

export const FlowEditorScreen: React.FC<FlowEditorScreenProps> = ({ onNavigate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Handle saving the routes configuration
  const handleSaveRoutes = async (routes: RouteConfig[]) => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      // In a real app, this would save to a server API
      // For this example, we'll just simulate saving

      console.log("Saving routes configuration:", routes);

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      setSaveResult({
        success: true,
        message: "Routes configuration saved successfully!"
      });

      // In a real app, you might refresh the routes from the server here
      // or navigate back to the main app
      setTimeout(() => {
        onNavigate(Screen.LANDING);
      }, 2000);
    } catch (error) {
      console.error("Error saving routes:", error);
      setSaveResult({
        success: false,
        message: "Failed to save routes configuration. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling the edit
  const handleCancel = () => {
    // Navigate back to the landing page
    onNavigate(Screen.LANDING);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Route Flow Editor</h1>
        <p>Configure the routing and navigation flow of your application</p>
      </div>

      {isSaving ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Saving configuration...</p>
        </div>
      ) : (
        <FlowEditor onSave={handleSaveRoutes} onCancel={handleCancel} />
      )}

      {saveResult && (
        <div className={`${styles.notification} ${saveResult.success ? styles.success : styles.error}`}>
          {saveResult.message}
        </div>
      )}
    </div>
  );
};
