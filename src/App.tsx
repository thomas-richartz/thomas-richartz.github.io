import { useState, useEffect, useCallback, useRef } from "react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { GalleryContextProvider } from "@/context/GalleryContext";
import { Screen } from "@/enums";
import { GalleryCatScreen } from "@/screens/GalleryCatScreen";
import { GalleryScreen } from "@/screens/GalleryScreen";
import { LandingScreen } from "@/screens/LandingScreen";
import { BottomBar } from "@/components/BottomBar";
import { ContactScreen } from "@/screens/ContactScreen";
import CollectionsMicrodata from "@/components/CollectionsMicrodata";
import styles from "@/App.module.css";
import * as Tone from "tone";
import { FileSoundBlock, ToneMusicScene } from "@/audio/ToneMusicScene";
import { DisplayPreferencesProvider } from "@/context/DisplayPreferencesContext";

function App() {
  // Screen state
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocks, setBlocks] = useState<FileSoundBlock[]>([]);
  const [fadeDuration] = useState(1.5);

  // Refs
  const sceneRef = useRef<ToneMusicScene | null>(null);
  const audioInitialized = useRef(false);
  const loadingAudio = useRef(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      const handleFirstInteraction = async () => {
        try {
          if (Tone.context.state !== "running") {
            await Tone.start();
            console.log("Audio context started");

            // Set a reasonable default volume to avoid being too loud
            Tone.getDestination().volume.value = -6;
          }

          // Fetch initial blocks if not already loaded
          if (blocks.length === 0 && !loadingAudio.current) {
            loadAudioBlocks("/assets/soundblocks/atellier_zukunft_scene2.json");
          }

          audioInitialized.current = true;
        } catch (error) {
          console.error("Failed to initialize audio:", error);
        }
      };

      // Listen for user interaction to start audio
      document.addEventListener("click", handleFirstInteraction, { once: true });
      document.addEventListener("touchstart", handleFirstInteraction, { once: true });

      return () => {
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
      };
    };

    return initAudio();
  }, [blocks.length]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        sceneRef.current.stop();
        sceneRef.current.dispose();
      }
      Tone.Transport.cancel();
      Tone.Transport.stop();
    };
  }, []);

  // Load audio blocks from a file
  const loadAudioBlocks = useCallback(
    async (url: string) => {
      if (loadingAudio.current) return;

      loadingAudio.current = true;
      setLoading(true);

      try {
        console.log(`Loading audio blocks from ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch blocks: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Loaded ${data.length} audio blocks`);

        // Stop current audio if playing
        if (isPlaying && sceneRef.current) {
          await stopAudio();
        }

        // Update blocks
        setBlocks(data);

        // If it was playing, restart with new blocks
        if (isPlaying) {
          setTimeout(() => playAudio(data), 100);
        }
      } catch (error) {
        console.error("Error loading audio blocks:", error);
      } finally {
        loadingAudio.current = false;
        setLoading(false);
      }
    },
    [isPlaying],
  );

  // Play audio with the current blocks
  const playAudio = useCallback(
    async (blocksToPlay?: FileSoundBlock[]) => {
      if (!audioInitialized.current) {
        console.warn("Audio not initialized yet");
        return;
      }

      try {
        // Use provided blocks or current state
        const currentBlocks = blocksToPlay || blocks;

        if (currentBlocks.length === 0) {
          console.warn("No blocks available to play");
          return;
        }

        // Ensure audio context is running
        if (Tone.context.state !== "running") {
          await Tone.start();
        }

        // Clean up any existing scene
        if (sceneRef.current) {
          sceneRef.current.stop();
          sceneRef.current.dispose();
          sceneRef.current = null;
        }

        // Create a new scene
        const newScene = new ToneMusicScene(currentBlocks, true, true);
        await newScene.load();
        sceneRef.current = newScene;

        // Start playback
        await newScene.scheduleQuantizedPlayback();

        setIsPlaying(true);
        console.log("Audio playback started");
      } catch (error) {
        console.error("Error starting audio playback:", error);
        setIsPlaying(false);
      }
    },
    [blocks],
  );

  // Stop audio with fade out
  const stopAudio = useCallback(async () => {
    if (!sceneRef.current) return;

    try {
      // Fade out
      await sceneRef.current.fadeOut(fadeDuration);

      // Stop and clean up
      sceneRef.current.stop();

      // Clean up Tone.js scheduling
      Tone.Transport.cancel();
      Tone.Transport.stop();

      setIsPlaying(false);
      console.log("Audio playback stopped");
    } catch (error) {
      console.error("Error stopping audio:", error);
      setIsPlaying(false);
    }
  }, [fadeDuration]);

  // Toggle audio playback
  const handleMusicToggle = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  // Handle navigation between screens
  const onNavigate = useCallback(
    async (screen: Screen) => {
      // Update screen state
      setSelectedScreen(screen);

      // Select appropriate audio for this screen
      let url: string;

      if (screen === Screen.LANDING) {
        url = "/assets/soundblocks/atellier_zukunft_scene3.json";
      } else if (screen === Screen.GALLERY && !selectedCat) {
        const galleryUrls = ["/assets/soundblocks/bowltest_scene.json", "/assets/soundblocks/test_scene.json"];
        url = galleryUrls[Math.floor(Math.random() * galleryUrls.length)];
      } else if (screen !== Screen.GALLERY && selectedCat === "Dovcenko2 (2022)") {
        const arsenalUrls = ["/assets/soundblocks/arsenal_scene.json", "/assets/soundblocks/test_scene.json"];
        url = arsenalUrls[Math.floor(Math.random() * arsenalUrls.length)];
      } else {
        // Default audio for other screens
        const defaultUrls = [
          "/assets/soundblocks/atellier_zukunft_scene.json",
          "/assets/soundblocks/atellier_zukunft_scene2.json",
          "/assets/soundblocks/atellier_zukunft_scene3.json",
          "/assets/soundblocks/atellier_zukunft_scene4.json",
        ];
        url = defaultUrls[Math.floor(Math.random() * defaultUrls.length)];
      }

      // Load the new audio
      await loadAudioBlocks(url);
    },
    [loadAudioBlocks, selectedCat],
  );

  // Search functionality
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
    setSelectedCat(category);
    setSelectedScreen(Screen.GALLERY);
    setSearchVisible(false);
  };

  return (
    <DisplayPreferencesProvider>
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
              if (sceneRef.current) {
                try {
                  sceneRef.current.stop();
                  sceneRef.current.dispose();
                } catch (e) {
                  /* ignore */
                }
                sceneRef.current = null;
              }
              audioInitialized.current = false;

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
    </DisplayPreferencesProvider>
  );
}

export default App;
