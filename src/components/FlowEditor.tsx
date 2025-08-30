import React, { useState, useEffect } from "react";
import styles from "./FlowEditor.module.css";
import { RouteConfig } from "@/context/RouterContext";
import { Screen } from "@/enums";
import { HomeIcon, ImageIcon, PersonIcon, GridIcon } from "@radix-ui/react-icons";

interface FlowEditorProps {
  onSave: (routes: RouteConfig[]) => void;
  onCancel: () => void;
}

// Icon options for routes
const iconOptions = [
  { name: "Home", component: <HomeIcon color="#cde" /> },
  { name: "Image", component: <ImageIcon color="#cde" /> },
  { name: "Person", component: <PersonIcon color="#cde" /> },
  { name: "Grid", component: <GridIcon color="#cde" /> },
];

export const FlowEditor: React.FC<FlowEditorProps> = ({ onSave, onCancel }) => {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load routes configuration
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        // In a real-world scenario, this might come from an API
        const response = await fetch("/src/config/routes.json");
        const data = await response.json();
        setRoutes(data.routes);
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Handle saving routes
  const handleSave = () => {
    // Save ordered by the order property
    const sortedRoutes = [...routes].sort((a, b) => a.order - b.order);
    onSave(sortedRoutes);
  };

  // Add a new route
  const handleAddRoute = () => {
    const newRoute: RouteConfig = {
      id: `route-${Date.now()}`,
      screenType: 5, // New screen type
      path: `/new-route-${Date.now()}`,
      label: "New Route",
      iconName: "Home",
      audioUrls: ["/assets/soundblocks/atellier_zukunft_scene.json"],
      order: routes.length + 1,
      visible: true,
    };

    setRoutes([...routes, newRoute]);
    setSelectedRouteIndex(routes.length);
  };

  // Delete a route
  const handleDeleteRoute = (index: number) => {
    const newRoutes = [...routes];
    newRoutes.splice(index, 1);

    // Reorder remaining routes
    newRoutes.forEach((route, idx) => {
      route.order = idx + 1;
    });

    setRoutes(newRoutes);
    setSelectedRouteIndex(null);
  };

  // Update a route property
  const handleRouteChange = (index: number, field: keyof RouteConfig, value: any) => {
    const newRoutes = [...routes];

    if (field === 'screenType') {
      // Ensure screenType is a number
      newRoutes[index][field] = parseInt(value, 10);
    } else if (field === 'visible') {
      // Toggle boolean for visible
      newRoutes[index][field] = value === true || value === 'true';
    } else if (field === 'audioUrls' && typeof value === 'string') {
      // Handle audioUrls as comma-separated list
      newRoutes[index][field] = value.split(',').map(url => url.trim());
    } else {
      // Handle other fields normally
      newRoutes[index][field] = value;
    }

    setRoutes(newRoutes);
  };

  // Move a route up or down in order
  const handleMoveRoute = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === routes.length - 1)
    ) {
      return; // Can't move first item up or last item down
    }

    const newRoutes = [...routes];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap the order property
    const tempOrder = newRoutes[index].order;
    newRoutes[index].order = newRoutes[swapIndex].order;
    newRoutes[swapIndex].order = tempOrder;

    // Swap the items in the array
    [newRoutes[index], newRoutes[swapIndex]] = [newRoutes[swapIndex], newRoutes[index]];

    setRoutes(newRoutes);
    setSelectedRouteIndex(swapIndex);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading routes configuration...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <h2>Flow Editor</h2>

      <div className={styles.routesList}>
        {routes.map((route, index) => (
          <div
            key={route.id}
            className={`${styles.routeItem} ${selectedRouteIndex === index ? styles.selected : ''}`}
            onClick={() => setSelectedRouteIndex(index)}
          >
            <span className={styles.routeIcon}>
              {iconOptions.find(icon => icon.name === route.iconName)?.component}
            </span>
            <span className={styles.routeLabel}>
              {route.label} ({getScreenName(route.screenType)})
            </span>
            <div className={styles.routeActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveRoute(index, 'up');
                }}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveRoute(index, 'down');
                }}
                disabled={index === routes.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
        <button className={styles.addButton} onClick={handleAddRoute}>
          + Add Route
        </button>
      </div>

      {selectedRouteIndex !== null && (
        <div className={styles.routeEditor}>
          <h3>Edit Route</h3>
          <div className={styles.formGroup}>
            <label>ID:</label>
            <input
              type="text"
              value={routes[selectedRouteIndex].id}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'id', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Screen Type:</label>
            <select
              value={routes[selectedRouteIndex].screenType}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'screenType', e.target.value)}
            >
              <option value={Screen.LANDING}>Landing</option>
              <option value={Screen.GALLERY}>Gallery</option>
              <option value={Screen.GALLERY_CAT}>Gallery Category</option>
              <option value={Screen.CONTACT}>Contact</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Path:</label>
            <input
              type="text"
              value={routes[selectedRouteIndex].path}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'path', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Label:</label>
            <input
              type="text"
              value={routes[selectedRouteIndex].label}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'label', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Icon:</label>
            <select
              value={routes[selectedRouteIndex].iconName}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'iconName', e.target.value)}
            >
              {iconOptions.map(icon => (
                <option key={icon.name} value={icon.name}>
                  {icon.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Audio URLs (comma-separated):</label>
            <textarea
              value={routes[selectedRouteIndex].audioUrls.join(', ')}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'audioUrls', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Order:</label>
            <input
              type="number"
              value={routes[selectedRouteIndex].order}
              onChange={(e) => handleRouteChange(selectedRouteIndex, 'order', parseInt(e.target.value, 10))}
              min={1}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={routes[selectedRouteIndex].visible}
                onChange={(e) => handleRouteChange(selectedRouteIndex, 'visible', e.target.checked)}
              />
              Visible in Navigation
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteRoute(selectedRouteIndex)}
            >
              Delete Route
            </button>
          </div>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Configuration
        </button>
      </div>
    </div>
  );
};

// Helper function to get screen name from enum
function getScreenName(screenType: number): string {
  switch (screenType) {
    case Screen.LANDING:
      return 'Landing';
    case Screen.GALLERY:
      return 'Gallery';
    case Screen.GALLERY_CAT:
      return 'Gallery Category';
    case Screen.CONTACT:
      return 'Contact';
    default:
      return `Screen ${screenType}`;
  }
}
