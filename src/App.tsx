import { useState, useEffect, useCallback, useRef } from "react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { GalleryContextProvider } from "@/context/GalleryContext";
import { Screen } from "@/enums";
import { GalleryCatScreen } from "@/screens/GalleryCatScreen";
import { GalleryScreen } from "@/screens/GalleryScreen";
import { LandingScreen } from "@/screens/LandingScreen";
import { BottomBar } from "@/components/BottomBar";
import { ContactScreen } from "@/screens/ContactScreen";
import ToneMusicSystem from "@/components/ToneMusicSystem";
import CollectionsMicrodata from "@/components/CollectionsMicrodata";
import styles from "@/App.module.css";
import { ToneMusicProvider, useToneMusic } from "@/context/ToneMusicContext";
import { SceneManager } from "@/audio/SceneManager";

function AppContent() {
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [verbose] = useState(true);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const audioInitializedRef = useRef<boolean>(false);
  const navigationReadyRef = useRef<boolean>(false);
  const initInProgressRef = useRef<boolean>(false);
  const loadingTimestampRef = useRef<number>(0);
  const pendingNavigationRef = useRef<{ screen: Screen; timestamp: number } | null>(null);
  const lastResetTimeRef = useRef<number>(0);

  // Use our new context
  const { isPlaying, togglePlay, setAudioBlocks, blocks, resetAudio, fadeDuration, setFadeDuration } = useToneMusic();
  const [preservePlayback, setPreservePlayback] = useState<boolean>(true);

  // Update SceneManager when playback state changes
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updatePlaybackState(isPlaying);

      // When audio is playing, always set preservePlayback to true to enable smooth transitions
      // This ensures continuous audio between scene transitions
      if (isPlaying) {
        setPreservePlayback(true);
      }
    }
  }, [isPlaying]);

  // Use the togglePlay function from the context
  const handleMusicToggle = useCallback(() => {
    console.log("App: Toggling music playback, current state:", isPlaying);
    if (blocks.length === 0) {
      console.warn("App: Cannot toggle music - no blocks loaded");
      return;
    }

    // Get the current fade duration from SceneManager if available
    const currentFadeDuration = sceneManagerRef.current ? sceneManagerRef.current.getCurrentFadeDuration() : fadeDuration;

    // Don't reset preservation when toggling - this allows audio to continue playing
    // through navigation even after manual toggle

    togglePlay(currentFadeDuration).catch((err) => console.error("Error toggling music:", err));
  }, [togglePlay, isPlaying, blocks.length, fadeDuration]);

  // Initialize SceneManager - only runs once on component mount
  useEffect(() => {
    const initSceneManager = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (sceneManagerRef.current || audioInitializedRef.current || initInProgressRef.current) {
        console.log("App: SceneManager already initialized or initialization in progress");
        return; // Already initialized or in progress
      }

      // Set flag to prevent concurrent initialization
      initInProgressRef.current = true;
      console.log("App: Initializing SceneManager");

      // Set a timeout to automatically reset initialization if it gets stuck
      const initTimeout = setTimeout(() => {
        if (initInProgressRef.current) {
          console.warn("App: Initialization stuck for 10 seconds, resetting");
          initInProgressRef.current = false;
          audioInitializedRef.current = false;

          // If we have a stuck SceneManager, clean it up
          if (sceneManagerRef.current) {
            try {
              sceneManagerRef.current.dispose();
            } catch (error) {
              console.warn("App: Error disposing stuck SceneManager:", error);
            }
            sceneManagerRef.current = null;
          }

          // Record reset time
          lastResetTimeRef.current = Date.now();
        }
      }, 10000);

      try {
        const sceneManager = new SceneManager(verbose);

        // Set callbacks
        sceneManager.setOnSceneLoadCallback((blocks, preservePlayback, defaultPlaying, sceneFadeDuration) => {
          console.log(
            `App: SceneManager loaded ${blocks.length} blocks, preservePlayback: ${preservePlayback}, defaultPlaying: ${defaultPlaying}, fadeDuration: ${sceneFadeDuration}`,
          );

          // Always preserve playback during navigation, regardless of current playback state
          // This ensures smooth transitions between scenes even if isPlaying temporarily becomes false
          const scenePreservePlayback = true;

          console.log(`App: Scene transition with preservePlayback=${scenePreservePlayback}, isPlaying=${isPlaying}`);
          // Use async/await to ensure blocks are fully processed before continuing
          setAudioBlocks(blocks, scenePreservePlayback)
            .then(() => {
              console.log("App: Audio blocks set successfully");
            })
            .catch((err) => {
              console.error("App: Error setting audio blocks:", err);
            });

          setFadeDuration(sceneFadeDuration ?? fadeDuration);
          setPreservePlayback(scenePreservePlayback);

          // Auto-play scene if defaultPlaying is true and we have blocks
          // Don't check isPlaying here, as we want to restart audio on navigation
          // even if it was previously playing
          if (defaultPlaying && blocks.length > 0) {
            // Add a small delay to ensure blocks are properly loaded
            setTimeout(() => {
              console.log(`App: Auto-playing scene with ${blocks.length} blocks`);
              togglePlay(sceneFadeDuration ?? fadeDuration).catch((err) => console.error("Error auto-playing scene:", err));
            }, 200);
          }

          // Always continue audio during navigation for smooth transitions
          // This prevents the audio from stopping when switching screens
          console.log(`App: Audio will continue playing during this navigation`);
        });

        sceneManager.setOnLoadingChangeCallback((isLoading) => {
          console.log(`App: SceneManager loading state: ${isLoading}`);
          setLoading(isLoading);
        });

        // Provide current playback state to SceneManager
        sceneManager.updatePlaybackState(isPlaying);

        // Assign to ref immediately so other effects can use it
        sceneManagerRef.current = sceneManager;

        // Set initialization flag to true
        audioInitializedRef.current = true;

        // Load configuration and handle initial navigation
        await sceneManager.loadConfig();
        console.log("App: SceneManager initialized with config");

        // Set initial screen to LANDING and trigger navigation
        if (selectedScreen === Screen.LANDING) {
          // Direct call if we're already on LANDING - using name-based navigation
          sceneManager.handleNavigation("LANDING");
        } else {
          // Force update to LANDING then let the effect handle it
          setSelectedScreen(Screen.LANDING);
        }

        // Mark navigation as ready
        navigationReadyRef.current = true;
        console.log("App: Navigation is now ready");
      } catch (error) {
        console.error("App: Failed to initialize SceneManager:", error);
        audioInitializedRef.current = false; // Allow retry
        if (sceneManagerRef.current) {
          try {
            sceneManagerRef.current.dispose();
          } catch (disposeError) {
            console.warn("App: Error disposing SceneManager after failed init:", disposeError);
          }
          sceneManagerRef.current = null;
        }
      } finally {
        // Reset in-progress flag regardless of success/failure
        initInProgressRef.current = false;
        // Clear the timeout since initialization completed (success or failure)
        clearTimeout(initTimeout);
      }
    };

    initSceneManager();

    // In development mode with React StrictMode, components mount twice
    // We'll keep the SceneManager instance alive across re-renders
    // and only dispose it when the component is truly unmounted
    return () => {
      // We'll intentionally NOT dispose the SceneManager here to prevent
      // the multiple initialization issue. The SceneManager will be
      // garbage collected when the app is closed.

      // Note: In a production environment, this won't be an issue
      // as React won't double-mount components in production.
      console.log("App: Component unmounting, but keeping SceneManager for stability");
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle screen changes with SceneManager
  useEffect(() => {
    // Skip if SceneManager initialization is in progress
    if (initInProgressRef.current) {
      console.log("App: Navigation change ignored - SceneManager initialization in progress");
      return;
    }

    // Only handle navigation changes if SceneManager is fully initialized
    if (sceneManagerRef.current && navigationReadyRef.current) {
      // Get the screen name from the enum for name-based navigation
      const screenName = Screen[selectedScreen];

      console.log(`App: Navigation changed - calling SceneManager with Screen=${screenName} (${selectedScreen}), Category=${selectedCat || "none"}`);

      // Small timeout to ensure state is fully updated
      setTimeout(() => {
        if (sceneManagerRef.current) {
          // Use name-based navigation for more reliable scene lookup
          sceneManagerRef.current.handleNavigation(screenName, selectedCat, false, isPlaying);
        }
      }, 50);
    } else if (sceneManagerRef.current) {
      console.log("App: Navigation changed but waiting for SceneManager initialization to complete");
    } else {
      console.warn("App: Navigation changed but SceneManager not initialized");
    }
  }, [selectedScreen, selectedCat]);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        // This will ensure the audio context is created and running
        await import("tone").then((Tone) => {
          if (Tone.context.state !== "running") {
            console.log("App: Initializing Tone.js audio context");
            document.addEventListener(
              "click",
              async () => {
                await Tone.start();
                console.log("App: Tone.js context started on user interaction");
              },
              { once: true },
            );
          }
        });
      } catch (error) {
        console.error("App: Failed to initialize audio:", error);
      }
    };

    initAudio();
  }, []);

  // Log when audio playback state changes
  useEffect(() => {
    console.log("App: Audio playback state changed to:", isPlaying);
  }, [isPlaying]);

  // Effect to track loading state changes and handle pending navigations
  useEffect(() => {
    if (loading) {
      // Record when loading started
      loadingTimestampRef.current = Date.now();

      // Check if loading has been stuck for too long (more than 8 seconds)
      const currentTime = Date.now();
      const loadingStartTime = loadingTimestampRef.current;
      const timeInLoading = currentTime - loadingStartTime;

      // If loading is stuck for more than 8 seconds and we haven't reset recently
      if (timeInLoading > 8000 && currentTime - lastResetTimeRef.current > 30000) {
        console.warn(`App: Loading stuck for ${timeInLoading}ms, performing force refresh`);

        // Force reset audio system
        try {
          if (sceneManagerRef.current) {
            sceneManagerRef.current.dispose();
            sceneManagerRef.current = null;
          }

          // Reset state
          audioInitializedRef.current = false;
          navigationReadyRef.current = false;
          initInProgressRef.current = false;

          // Create a new scene manager
          const newSceneManager = new SceneManager(verbose);
          sceneManagerRef.current = newSceneManager;

          // Record reset time to prevent frequent resets
          lastResetTimeRef.current = currentTime;

          // Force navigate to landing
          setTimeout(() => {
            setSelectedScreen(Screen.LANDING);
            if (sceneManagerRef.current) {
              sceneManagerRef.current.handleNavigation("LANDING", "", true, true);
            }
          }, 500);
        } catch (error) {
          console.error("App: Failed to reset audio system:", error);
        }
      }
    } else {
      // Reset loading timestamp
      loadingTimestampRef.current = 0;

      // Process any pending navigation when loading completes
      if (pendingNavigationRef.current) {
        const { screen, timestamp } = pendingNavigationRef.current;
        const timeSinceRequest = Date.now() - timestamp;

        console.log(`App: Processing pending navigation to ${Screen[screen]} after ${timeSinceRequest}ms wait`);

        // Small timeout to ensure loading state is fully cleared
        setTimeout(() => {
          onNavigate(screen);
        }, 50);
      }
    }
  }, [loading, verbose]);

  const onNavigate = (screen: Screen) => {
    console.log(`App: onNavigate called with screen: ${Screen[screen]} (${screen})`);

    // Prevent multiple rapid navigations but allow if loading for too long
    if (loading) {
      // Check if loading has been going for too long (more than 3 seconds)
      const currentTime = Date.now();
      const loadingStartTime = loadingTimestampRef.current || currentTime;
      const timeInLoading = currentTime - loadingStartTime;

      // Allow navigation to proceed if loading for more than 3 seconds
      if (timeInLoading < 3000) {
        console.log(`App: Navigation request paused - still loading previous scene (${timeInLoading}ms)`);

        // Queue this navigation request to run once loading finishes
        pendingNavigationRef.current = {
          screen,
          timestamp: currentTime,
        };

        return;
      } else {
        console.log(`App: Forcing navigation despite loading state - loading stuck for ${timeInLoading}ms`);
      }
    }

    if (sceneManagerRef.current && navigationReadyRef.current) {
      const screenName = Screen[screen];
      console.log(`App: Using name-based navigation with: ${screenName}`);

      // Always pass true for preservePlayback to enable smooth transitions
      // This ensures audio continuity between scenes regardless of current playback state
      try {
        sceneManagerRef.current.handleNavigation(screenName, selectedCat, false, true);
        setSelectedScreen(screen);
      } catch (error) {
        console.error(`App: Navigation error:`, error);

        // If navigation fails and we haven't reset recently, force a reset
        const currentTime = Date.now();
        if (currentTime - lastResetTimeRef.current > 30000) {
          console.warn("App: Navigation failed, forcing reset");
          lastResetTimeRef.current = currentTime;

          // Force refresh on next render cycle
          setTimeout(() => {
            // Reset SceneManager
            if (sceneManagerRef.current) {
              try {
                sceneManagerRef.current.dispose();
              } catch (e) {
                console.warn("App: Error disposing SceneManager:", e);
              }
              sceneManagerRef.current = null;
            }

            // Reset state
            audioInitializedRef.current = false;
            navigationReadyRef.current = false;
            setSelectedScreen(Screen.LANDING);
          }, 100);
        }
      }

      // Clear any pending navigation now that we've navigated
      pendingNavigationRef.current = null;
    } else {
      setSelectedScreen(screen);
      console.log(`App: Navigation deferred - SceneManager not ready`);
    }
  };
  const handleSearchOpen = async () => {
    if (images.length === 0) {
      setLoadingImages(true);
      // Dynamically load `allImages` when search is triggered
      const { allImages } = await import("./assets/assets");
      setImages(allImages);
      setLoadingImages(false);
    }
    setSearchVisible(true);
  };

  const handleSearchClose = () => {
    setSearchVisible(false);
  };

  const handleItemSelect = (category: string) => {
    console.log(`App: Selected category: ${category}`);

    // If SceneManager is ready, use direct navigation
    if (sceneManagerRef.current && navigationReadyRef.current) {
      console.log(`App: Using direct navigation to GALLERY with category: ${category}`);
      // Always preserve playback state during navigation
      // This ensures smooth transitions between scenes regardless of current playback state
      sceneManagerRef.current.handleNavigation("GALLERY", category, false, true);

      // Update UI state to match
      setSelectedScreen(Screen.GALLERY);
      setSelectedCat(category);
    } else {
      // Fall back to state-based navigation
      // If we're already on the gallery screen, just update the category
      if (selectedScreen === Screen.GALLERY) {
        setSelectedCat(category);
      } else {
        // First set the screen, then the category to ensure proper order of effects
        setSelectedScreen(Screen.GALLERY);
        // Use a small timeout to ensure the screen state is updated first
        setTimeout(() => setSelectedCat(category), 50);
      }
    }
    setSearchVisible(false);
  };

  return (
    <GalleryContextProvider>
      <CollectionsMicrodata />
      <div tabIndex={0}>
        <main className={styles.warehouseWrap}>
          <>
            {selectedScreen === Screen.LANDING ? (
              <LandingScreen onCatClick={(cat) => setSelectedCat(cat)} onNavigate={onNavigate} />
            ) : selectedScreen === Screen.GALLERY ? (
              <GalleryScreen onCatClick={(cat) => setSelectedCat(cat)} onNavigate={onNavigate} />
            ) : selectedScreen === Screen.CONTACT ? (
              <ContactScreen onCatClick={(cat) => setSelectedCat(cat)} onNavigate={onNavigate} onSearch={handleSearchOpen} />
            ) : (
              <GalleryCatScreen cat={selectedCat} onClick={(cat) => setSelectedCat(cat)} />
            )}

            {blocks.length > 0 && (
              <ToneMusicSystem
                onLoadingChange={setLoading}
                play={isPlaying}
                blocks={blocks}
                verbose={verbose}
                fadeDuration={sceneManagerRef.current?.getCurrentFadeDuration() || fadeDuration || 1.5}
                preservePlayback={preservePlayback}
                key={`music-system-${blocks.length}`}
              />
            )}
            <BottomBar
              onNavigate={onNavigate}
              selectedScreen={selectedScreen}
              onSearch={handleSearchOpen}
              onMusicToggle={handleMusicToggle}
              isPlaying={isPlaying}
            />
          </>
          {isSearchVisible && <SearchOverlay items={images} isLoading={isLoadingImages} onClose={handleSearchClose} onItemSelect={handleItemSelect} />}
        </main>
      </div>

      {/* Add a hidden emergency reset button for stuck states */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "30px",
          height: "30px",
          background: "transparent",
          zIndex: 9999,
        }}
        onClick={(e) => {
          if (e.altKey && e.shiftKey) {
            console.log("App: Emergency reset triggered");
            // Force reset everything
            if (sceneManagerRef.current) {
              try {
                sceneManagerRef.current.dispose();
              } catch (e) {
                /* ignore */
              }
              sceneManagerRef.current = null;
            }
            audioInitializedRef.current = false;
            navigationReadyRef.current = false;
            initInProgressRef.current = false;
            lastResetTimeRef.current = Date.now();

            // Force navigate to landing
            setSelectedScreen(Screen.LANDING);

            // Force a page reload if Alt+Shift+Triple click
            if ((e.nativeEvent as any).detail === 3) {
              window.location.reload();
            }
          }
        }}
      ></div>
    </GalleryContextProvider>
  );
}

function App() {
  // Get global settings from local storage or use defaults
  const getInitialFadeDuration = () => {
    try {
      const stored = localStorage.getItem("fadeDuration");
      return stored ? parseFloat(stored) : 1.5;
    } catch (e) {
      return 1.5;
    }
  };

  return (
    <ToneMusicProvider initialVerbose={true} initialFadeDuration={getInitialFadeDuration()}>
      <AppContent key="app-content" />
    </ToneMusicProvider>
  );
}

export default App;
