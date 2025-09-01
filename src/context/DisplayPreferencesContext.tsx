import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DisplayPreferencesContextType {
  resolution: "high" | "low";
  fullscreen: boolean;
  fullscreenSource: "user-settings" | "intense-image" | null;
  setResolution: (resolution: "high" | "low") => void;
  setFullscreen: (fullscreen: boolean, source?: "user-settings" | "intense-image") => void;
  applyFullscreen: (source?: "user-settings" | "intense-image") => Promise<void>;
  exitFullscreen: (source?: "user-settings" | "intense-image") => Promise<void>;
  isFullscreenFromUserSettings: () => boolean;
  isFullscreenFromIntenseImage: () => boolean;
}

const defaultContext: DisplayPreferencesContextType = {
  resolution: "high",
  fullscreen: false,
  fullscreenSource: null,
  setResolution: () => {},
  setFullscreen: () => {},
  applyFullscreen: async () => {},
  exitFullscreen: async () => {},
  isFullscreenFromUserSettings: () => false,
  isFullscreenFromIntenseImage: () => false,
};

const DisplayPreferencesContext = createContext<DisplayPreferencesContextType>(defaultContext);

export const useDisplayPreferences = () => useContext(DisplayPreferencesContext);

interface DisplayPreferencesProviderProps {
  children: ReactNode;
}

export const DisplayPreferencesProvider: React.FC<DisplayPreferencesProviderProps> = ({ children }) => {
  const [resolution, setResolutionState] = useState<"high" | "low">("high");
  const [fullscreen, setFullscreenState] = useState<boolean>(false);
  const [fullscreenSource, setFullscreenSource] = useState<"user-settings" | "intense-image" | null>(null);

  // Load saved preferences when component mounts
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("userDisplayPreferences");
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setResolutionState(parsedPrefs.resolution || "high");
        setFullscreenState(parsedPrefs.fullscreen || false);
        setFullscreenSource(parsedPrefs.fullscreenSource || null);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    try {
      const userPrefs = {
        resolution,
        fullscreen,
        fullscreenSource,
      };
      localStorage.setItem("userDisplayPreferences", JSON.stringify(userPrefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }, [resolution, fullscreen]);

  // Apply fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreen) {
        // If we exited fullscreen from browser controls, update our state
        setFullscreenState(false);
        setFullscreenSource(null);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [fullscreen]);

  const setResolution = (newResolution: "high" | "low") => {
    setResolutionState(newResolution);
  };

  const setFullscreen = (newFullscreen: boolean, source?: "user-settings" | "intense-image") => {
    setFullscreenState(newFullscreen);
    if (source) {
      setFullscreenSource(source);
    } else if (!newFullscreen) {
      setFullscreenSource(null);
    }
    // We don't immediately apply fullscreen here to separate state from effect
  };

  const applyFullscreen = async (source?: "user-settings" | "intense-image") => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        if (source) {
          setFullscreenSource(source);
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    }
  };

  const exitFullscreen = async (source?: "user-settings" | "intense-image") => {
    if (document.fullscreenElement) {
      try {
        // Only exit if the source matches or no source specified
        if (!source || source === fullscreenSource) {
          await document.exitFullscreen();
          setFullscreenSource(null);
        }
      } catch (err) {
        console.error("Error attempting to exit fullscreen:", err);
      }
    }
  };

  const isFullscreenFromUserSettings = () => {
    return fullscreen && fullscreenSource === "user-settings";
  };

  const isFullscreenFromIntenseImage = () => {
    return fullscreen && fullscreenSource === "intense-image";
  };

  return (
    <DisplayPreferencesContext.Provider
      value={{
        resolution,
        fullscreen,
        fullscreenSource,
        setResolution,
        setFullscreen,
        applyFullscreen,
        exitFullscreen,
        isFullscreenFromUserSettings,
        isFullscreenFromIntenseImage,
      }}
    >
      {children}
    </DisplayPreferencesContext.Provider>
  );
};
