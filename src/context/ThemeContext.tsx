import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminTheme, applyTheme, getThemeById, neutralDarkTheme } from '@/components/Admin/themes';

// Theme context interface
interface ThemeContextType {
  currentTheme: AdminTheme;
  setTheme: (themeId: string) => void;
}

// Local storage key for user preferences
const USER_PREFS_KEY = 'userPrefs';
const THEME_PREF_KEY = 'adminTheme';

// Create the theme context with default values
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: neutralDarkTheme,
  setTheme: () => {},
});

/**
 * Theme provider component for managing theme state
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<AdminTheme>(neutralDarkTheme);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const userPrefs = localStorage.getItem(USER_PREFS_KEY);
      if (userPrefs) {
        const prefs = JSON.parse(userPrefs);
        if (prefs[THEME_PREF_KEY]) {
          const savedTheme = getThemeById(prefs[THEME_PREF_KEY]);
          setCurrentTheme(savedTheme);
          applyTheme(savedTheme);
          return;
        }
      }
      // If no saved theme, apply the default theme
      applyTheme(neutralDarkTheme);
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      applyTheme(neutralDarkTheme);
    }
  }, []);

  // Set a new theme and save to localStorage
  const setTheme = (themeId: string) => {
    try {
      const theme = getThemeById(themeId);
      setCurrentTheme(theme);
      applyTheme(theme);

      // Save to localStorage
      const userPrefs = localStorage.getItem(USER_PREFS_KEY);
      const prefs = userPrefs ? JSON.parse(userPrefs) : {};
      prefs[THEME_PREF_KEY] = themeId;
      localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook for accessing the theme context
 */
export const useTheme = (): ThemeContextType => useContext(ThemeContext);
