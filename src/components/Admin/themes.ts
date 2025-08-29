/**
 * Admin Theme Definitions
 *
 * This file contains the theme definitions for the admin panel.
 * Each theme is a set of CSS variables that will be applied to the :root element.
 */

export interface AdminTheme {
  id: string;
  name: string;
  variables: Record<string, string>;
}

// Neutral Dark Theme (Modern)
export const neutralDarkTheme: AdminTheme = {
  id: "neutral-dark",
  name: "Neutral Dark",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#1a1a1a",
    "--admin-bg-mid": "#2a2a2a",
    "--admin-bg-light": "#383838",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(40, 40, 40, 0.7)",
    "--admin-element-bg": "rgba(30, 30, 30, 0.25)",
    "--admin-element-highlight": "rgba(100, 149, 237, 0.7)",
    "--admin-element-highlight-bg": "rgba(100, 149, 237, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(100, 149, 237, 0.2)",
    "--admin-border-moderate": "rgba(100, 149, 237, 0.3)",
    "--admin-border-highlight": "rgba(100, 149, 237, 0.5)",

    // Text Colors
    "--admin-text-primary": "#f0f0f0",
    "--admin-text-secondary": "rgba(240, 240, 240, 0.7)",
    "--admin-text-muted": "rgba(240, 240, 240, 0.5)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #6495ED 0%, #4169E1 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #7da6ff 0%, #5a7ef5 100%)",
    "--admin-button-secondary": "rgba(100, 149, 237, 0.2)",
    "--admin-button-secondary-hover": "rgba(100, 149, 237, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 2px 8px rgba(0, 0, 0, 0.3)",
    "--admin-shadow-moderate": "0 4px 12px rgba(0, 0, 0, 0.35)",
    "--admin-shadow-strong": "0 8px 32px rgba(10, 10, 10, 0.4)",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(10px)",
    "--admin-overlay-bg": "rgba(35, 35, 35, 0.7)",

    // Mesh Background
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(100, 149, 237, 0.15) 0%, rgba(100, 149, 237, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0) 60%), " +
      "radial-gradient(circle at 85% 15%, rgba(135, 206, 235, 0.15) 0%, rgba(135, 206, 235, 0) 60%), " +
      "radial-gradient(circle at 15% 85%, rgba(176, 196, 222, 0.15) 0%, rgba(176, 196, 222, 0) 60%)",
  },
};

// Neutral Dark Theme (Compact)
export const neutralDarkCompactTheme: AdminTheme = {
  id: "neutral-dark-compact",
  name: "Neutral Dark Compact",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#1a1a1a",
    "--admin-bg-mid": "#2a2a2a",
    "--admin-bg-light": "#383838",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(40, 40, 40, 0.9)",
    "--admin-element-bg": "rgba(30, 30, 30, 0.4)",
    "--admin-element-highlight": "rgba(100, 149, 237, 0.8)",
    "--admin-element-highlight-bg": "rgba(100, 149, 237, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(100, 149, 237, 0.2)",
    "--admin-border-moderate": "rgba(100, 149, 237, 0.3)",
    "--admin-border-highlight": "rgba(100, 149, 237, 0.5)",

    // Text Colors
    "--admin-text-primary": "#f0f0f0",
    "--admin-text-secondary": "rgba(240, 240, 240, 0.7)",
    "--admin-text-muted": "rgba(240, 240, 240, 0.5)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #6495ED 0%, #4169E1 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #7da6ff 0%, #5a7ef5 100%)",
    "--admin-button-secondary": "rgba(100, 149, 237, 0.2)",
    "--admin-button-secondary-hover": "rgba(100, 149, 237, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 1px 2px rgba(0, 0, 0, 0.2)",
    "--admin-shadow-moderate": "0 2px 4px rgba(0, 0, 0, 0.25)",
    "--admin-shadow-strong": "0 3px 8px rgba(10, 10, 10, 0.3)",

    // Overrides for compact look
    "--admin-radius-sm": "0px",
    "--admin-radius-md": "0px",
    "--admin-radius-lg": "0px",
    "--admin-spacing-xs": "0.3rem",
    "--admin-spacing-sm": "0.5rem",
    "--admin-spacing-md": "0.8rem",
    "--admin-spacing-lg": "1.2rem",
    "--admin-spacing-xl": "1.8rem",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(5px)",
    "--admin-overlay-bg": "rgba(35, 35, 35, 0.85)",

    // Mesh Background - simplified for compact look
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(100, 149, 237, 0.08) 0%, rgba(100, 149, 237, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(70, 130, 180, 0.08) 0%, rgba(70, 130, 180, 0) 60%)",
  },
};

// Earth Tones Theme (Modern)
export const earthTonesTheme: AdminTheme = {
  id: "earth-tones",
  name: "Earth Tones",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#1a1510",
    "--admin-bg-mid": "#2c2420",
    "--admin-bg-light": "#382e25",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(40, 30, 25, 0.7)",
    "--admin-element-bg": "rgba(30, 25, 20, 0.25)",
    "--admin-element-highlight": "rgba(173, 125, 88, 0.7)",
    "--admin-element-highlight-bg": "rgba(173, 125, 88, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(173, 125, 88, 0.2)",
    "--admin-border-moderate": "rgba(173, 125, 88, 0.3)",
    "--admin-border-highlight": "rgba(173, 125, 88, 0.5)",

    // Text Colors
    "--admin-text-primary": "#f0e6d9",
    "--admin-text-secondary": "rgba(240, 230, 217, 0.7)",
    "--admin-text-muted": "rgba(240, 230, 217, 0.5)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #ad7d58 0%, #8c6347 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #c08f68 0%, #9d7357 100%)",
    "--admin-button-secondary": "rgba(173, 125, 88, 0.2)",
    "--admin-button-secondary-hover": "rgba(173, 125, 88, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 2px 8px rgba(0, 0, 0, 0.3)",
    "--admin-shadow-moderate": "0 4px 12px rgba(0, 0, 0, 0.35)",
    "--admin-shadow-strong": "0 8px 32px rgba(20, 15, 10, 0.4)",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(10px)",
    "--admin-overlay-bg": "rgba(35, 25, 20, 0.7)",

    // Mesh Background
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(173, 125, 88, 0.15) 0%, rgba(173, 125, 88, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(128, 93, 67, 0.2) 0%, rgba(128, 93, 67, 0) 60%), " +
      "radial-gradient(circle at 85% 15%, rgba(153, 112, 80, 0.15) 0%, rgba(153, 112, 80, 0) 60%), " +
      "radial-gradient(circle at 15% 85%, rgba(140, 99, 71, 0.15) 0%, rgba(140, 99, 71, 0) 60%)",
  },
};

// Earth Tones Theme (Compact)
export const earthTonesCompactTheme: AdminTheme = {
  id: "earth-tones-compact",
  name: "Earth Tones Compact",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#1a1510",
    "--admin-bg-mid": "#2c2420",
    "--admin-bg-light": "#382e25",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(40, 30, 25, 0.9)",
    "--admin-element-bg": "rgba(30, 25, 20, 0.4)",
    "--admin-element-highlight": "rgba(173, 125, 88, 0.8)",
    "--admin-element-highlight-bg": "rgba(173, 125, 88, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(173, 125, 88, 0.2)",
    "--admin-border-moderate": "rgba(173, 125, 88, 0.3)",
    "--admin-border-highlight": "rgba(173, 125, 88, 0.5)",

    // Text Colors
    "--admin-text-primary": "#f0e6d9",
    "--admin-text-secondary": "rgba(240, 230, 217, 0.7)",
    "--admin-text-muted": "rgba(240, 230, 217, 0.5)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #ad7d58 0%, #8c6347 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #c08f68 0%, #9d7357 100%)",
    "--admin-button-secondary": "rgba(173, 125, 88, 0.2)",
    "--admin-button-secondary-hover": "rgba(173, 125, 88, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 1px 2px rgba(0, 0, 0, 0.2)",
    "--admin-shadow-moderate": "0 2px 4px rgba(0, 0, 0, 0.25)",
    "--admin-shadow-strong": "0 3px 8px rgba(20, 15, 10, 0.3)",

    // Overrides for compact look
    "--admin-radius-sm": "0px",
    "--admin-radius-md": "0px",
    "--admin-radius-lg": "0px",
    "--admin-spacing-xs": "0.3rem",
    "--admin-spacing-sm": "0.5rem",
    "--admin-spacing-md": "0.8rem",
    "--admin-spacing-lg": "1.2rem",
    "--admin-spacing-xl": "1.8rem",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(5px)",
    "--admin-overlay-bg": "rgba(35, 25, 20, 0.85)",

    // Mesh Background - simplified for compact look
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(173, 125, 88, 0.08) 0%, rgba(173, 125, 88, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(128, 93, 67, 0.08) 0%, rgba(128, 93, 67, 0) 60%)",
  },
};

// Monokai Theme
export const monokaiTheme: AdminTheme = {
  id: "monokai",
  name: "Monokai",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#272822",
    "--admin-bg-mid": "#3e3d32",
    "--admin-bg-light": "#49483e",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(39, 40, 34, 0.7)",
    "--admin-element-bg": "rgba(39, 40, 34, 0.25)",
    "--admin-element-highlight": "rgba(249, 38, 114, 0.7)",
    "--admin-element-highlight-bg": "rgba(249, 38, 114, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(249, 38, 114, 0.2)",
    "--admin-border-moderate": "rgba(249, 38, 114, 0.3)",
    "--admin-border-highlight": "rgba(249, 38, 114, 0.5)",

    // Text Colors
    "--admin-text-primary": "#f8f8f2",
    "--admin-text-secondary": "rgba(248, 248, 242, 0.7)",
    "--admin-text-muted": "rgba(248, 248, 242, 0.5)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #f92672 0%, #a6004c 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #ff3385 0%, #c40f61 100%)",
    "--admin-button-secondary": "rgba(249, 38, 114, 0.2)",
    "--admin-button-secondary-hover": "rgba(249, 38, 114, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 2px 8px rgba(0, 0, 0, 0.3)",
    "--admin-shadow-moderate": "0 4px 12px rgba(0, 0, 0, 0.35)",
    "--admin-shadow-strong": "0 8px 32px rgba(0, 0, 0, 0.4)",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(10px)",
    "--admin-overlay-bg": "rgba(39, 40, 34, 0.7)",

    // Mesh Background
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(249, 38, 114, 0.15) 0%, rgba(249, 38, 114, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(166, 226, 46, 0.2) 0%, rgba(166, 226, 46, 0) 60%), " +
      "radial-gradient(circle at 85% 15%, rgba(102, 217, 239, 0.15) 0%, rgba(102, 217, 239, 0) 60%), " +
      "radial-gradient(circle at 15% 85%, rgba(253, 151, 31, 0.15) 0%, rgba(253, 151, 31, 0) 60%)",
  },
};

// Solarized Dark Theme
export const solarizedDarkTheme: AdminTheme = {
  id: "solarized-dark",
  name: "Solarized Dark",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#002b36",
    "--admin-bg-mid": "#073642",
    "--admin-bg-light": "#0d4a59",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(7, 54, 66, 0.7)",
    "--admin-element-bg": "rgba(7, 54, 66, 0.25)",
    "--admin-element-highlight": "rgba(38, 139, 210, 0.7)",
    "--admin-element-highlight-bg": "rgba(38, 139, 210, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(38, 139, 210, 0.2)",
    "--admin-border-moderate": "rgba(38, 139, 210, 0.3)",
    "--admin-border-highlight": "rgba(38, 139, 210, 0.5)",

    // Text Colors
    "--admin-text-primary": "#93a1a1",
    "--admin-text-secondary": "rgba(147, 161, 161, 0.8)",
    "--admin-text-muted": "rgba(147, 161, 161, 0.6)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #268bd2 0%, #1a6aa3 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #4ba1e2 0%, #2d7eb9 100%)",
    "--admin-button-secondary": "rgba(38, 139, 210, 0.2)",
    "--admin-button-secondary-hover": "rgba(38, 139, 210, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 2px 8px rgba(0, 0, 0, 0.3)",
    "--admin-shadow-moderate": "0 4px 12px rgba(0, 0, 0, 0.35)",
    "--admin-shadow-strong": "0 8px 32px rgba(0, 0, 0, 0.4)",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(10px)",
    "--admin-overlay-bg": "rgba(0, 43, 54, 0.7)",

    // Mesh Background
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(38, 139, 210, 0.15) 0%, rgba(38, 139, 210, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(108, 113, 196, 0.2) 0%, rgba(108, 113, 196, 0) 60%), " +
      "radial-gradient(circle at 85% 15%, rgba(42, 161, 152, 0.15) 0%, rgba(42, 161, 152, 0) 60%), " +
      "radial-gradient(circle at 15% 85%, rgba(181, 137, 0, 0.15) 0%, rgba(181, 137, 0, 0) 60%)",
  },
};

// Solarized Light Theme
export const solarizedLightTheme: AdminTheme = {
  id: "solarized-light",
  name: "Solarized Light",
  variables: {
    // Base Colors
    "--admin-bg-dark": "#fdf6e3",
    "--admin-bg-mid": "#eee8d5",
    "--admin-bg-light": "#dfd9c8",

    // Gradients
    "--admin-gradient-main": "linear-gradient(125deg, var(--admin-bg-dark) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-light) 100%)",

    // UI Element Colors
    "--admin-panel-bg": "rgba(238, 232, 213, 0.7)",
    "--admin-element-bg": "rgba(238, 232, 213, 0.5)",
    "--admin-element-highlight": "rgba(38, 139, 210, 0.7)",
    "--admin-element-highlight-bg": "rgba(38, 139, 210, 0.15)",

    // Border Colors
    "--admin-border-subtle": "rgba(38, 139, 210, 0.2)",
    "--admin-border-moderate": "rgba(38, 139, 210, 0.3)",
    "--admin-border-highlight": "rgba(38, 139, 210, 0.5)",

    // Text Colors
    "--admin-text-primary": "#586e75",
    "--admin-text-secondary": "rgba(88, 110, 117, 0.8)",
    "--admin-text-muted": "rgba(88, 110, 117, 0.6)",

    // Button Colors
    "--admin-button-primary": "linear-gradient(135deg, #268bd2 0%, #1a6aa3 100%)",
    "--admin-button-primary-hover": "linear-gradient(135deg, #4ba1e2 0%, #2d7eb9 100%)",
    "--admin-button-secondary": "rgba(38, 139, 210, 0.2)",
    "--admin-button-secondary-hover": "rgba(38, 139, 210, 0.35)",

    // Shadows
    "--admin-shadow-subtle": "0 2px 8px rgba(0, 0, 0, 0.1)",
    "--admin-shadow-moderate": "0 4px 12px rgba(0, 0, 0, 0.15)",
    "--admin-shadow-strong": "0 8px 32px rgba(0, 0, 0, 0.2)",

    // Overlays and Backdrops
    "--admin-backdrop-blur": "blur(10px)",
    "--admin-overlay-bg": "rgba(238, 232, 213, 0.7)",

    // Mesh Background
    "--admin-mesh-bg":
      "radial-gradient(circle at 25% 25%, rgba(38, 139, 210, 0.1) 0%, rgba(38, 139, 210, 0) 60%), " +
      "radial-gradient(circle at 75% 75%, rgba(108, 113, 196, 0.15) 0%, rgba(108, 113, 196, 0) 60%), " +
      "radial-gradient(circle at 85% 15%, rgba(42, 161, 152, 0.1) 0%, rgba(42, 161, 152, 0) 60%), " +
      "radial-gradient(circle at 15% 85%, rgba(181, 137, 0, 0.1) 0%, rgba(181, 137, 0, 0) 60%)",
  },
};

// List of all available themes
export const themes: AdminTheme[] = [
  neutralDarkTheme,
  neutralDarkCompactTheme,
  earthTonesTheme,
  earthTonesCompactTheme,
  monokaiTheme,
  solarizedDarkTheme,
  solarizedLightTheme,
];

// Get a theme by ID
export function getThemeById(id: string): AdminTheme {
  return themes.find((theme) => theme.id === id) || neutralDarkTheme;
}

// Apply a theme to the document
export function applyTheme(theme: AdminTheme): void {
  // Apply all theme variables
  Object.entries(theme.variables).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });

  // Add compact classes based on theme
  const adminPanel = document.querySelector(".adminPanel");
  if (adminPanel) {
    // Remove existing theme classes
    adminPanel.classList.remove("admin-scientific", "admin-compact");

    // Add compact classes for specific themes
    if (theme.id.includes("-compact")) {
      adminPanel.classList.add("admin-compact");
    }
  }
}
