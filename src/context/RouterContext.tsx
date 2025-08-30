import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import routesConfig from '@/config/routes.json';
import { Screen } from '@/enums';

// Types
export type RouteConfig = {
  id: string;
  screenType: number;
  path: string;
  label: string;
  iconName: string;
  audioUrls: string[];
  specialCategories?: Record<string, string[]>;
  order: number;
  visible: boolean;
};

export type RouterContextType = {
  currentScreen: Screen;
  currentCategory: string;
  navigateTo: (screen: Screen, category?: string) => void;
  getAudioUrlForScreen: (screen: Screen, category?: string) => string;
  getVisibleRoutes: () => RouteConfig[];
  getRouteByScreen: (screen: Screen) => RouteConfig | undefined;
};

// Create the context
const RouterContext = createContext<RouterContextType | null>(null);

// Provider component
export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LANDING);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [routes, setRoutes] = useState<RouteConfig[]>(routesConfig.routes);

  // Load routes from configuration
  useEffect(() => {
    // This could be extended to fetch routes from an API
    setRoutes(routesConfig.routes);
  }, []);

  // Navigate to a specific screen
  const navigateTo = useCallback((screen: Screen, category?: string) => {
    setCurrentScreen(screen);
    if (category !== undefined) {
      setCurrentCategory(category);
    }
  }, []);

  // Get a random audio URL for the current screen and category
  const getAudioUrlForScreen = useCallback((screen: Screen, category?: string): string => {
    const route = routes.find(r => r.screenType === screen);
    if (!route) return "";

    // Check for special category audio
    if (category && route.specialCategories && route.specialCategories[category]) {
      const categoryUrls = route.specialCategories[category];
      return categoryUrls[Math.floor(Math.random() * categoryUrls.length)];
    }

    // Use default audio for this screen
    return route.audioUrls[Math.floor(Math.random() * route.audioUrls.length)];
  }, [routes]);

  // Get all visible routes for navigation
  const getVisibleRoutes = useCallback(() => {
    return routes
      .filter(route => route.visible)
      .sort((a, b) => a.order - b.order);
  }, [routes]);

  // Get route configuration by screen type
  const getRouteByScreen = useCallback((screen: Screen) => {
    return routes.find(route => route.screenType === screen);
  }, [routes]);

  // Context value
  const contextValue: RouterContextType = {
    currentScreen,
    currentCategory,
    navigateTo,
    getAudioUrlForScreen,
    getVisibleRoutes,
    getRouteByScreen
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
};

// Custom hook to use the router context
export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
