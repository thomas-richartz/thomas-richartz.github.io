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

function AppContent() {
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [verbose] = useState(true);

  // Use our new context
  const { isPlaying, togglePlay, setAudioBlocks, blocks, resetAudio } = useToneMusic();

  // Use the togglePlay function from the context
  const handleMusicToggle = useCallback(() => {
    console.log("App: Toggling music playback, current state:", isPlaying);
    if (blocks.length === 0) {
      console.warn("App: Cannot toggle music - no blocks loaded");
      return;
    }
    togglePlay().catch((err) => console.error("Error toggling music:", err));
  }, [togglePlay, isPlaying, blocks.length]);

  useEffect(() => {
    if (selectedScreen === Screen.LANDING) {
      const fetchBlocks = async () => {
        try {
          const response = await fetch("/assets/soundblocks/kalimba_piano_scene.json");
          if (!response.ok) {
            throw new Error(`Failed to fetch blocks: ${response.status}`);
          }
          const data = await response.json();
          console.log("App: Loaded initial blocks:", data.length);
          setAudioBlocks(data);
        } catch (error) {
          console.error("Error fetching blocks:", error);
        }
      };
      fetchBlocks();
    }
  }, [selectedScreen, setAudioBlocks]);

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

  const onNavigate = async (screen: Screen) => {
    setSelectedScreen(screen);
    // Fetch blocks for the new screen
    const urls = [
      "/assets/soundblocks/atellier_zukunft_scene.json",
      "/assets/soundblocks/atellier_zukunft2_scene.json",
      "/assets/soundblocks/atellier_zukunft3_scene.json",
      "/assets/soundblocks/atellier_zukunft4_scene.json",
    ];
    let url = urls[Math.floor(Math.random() * urls.length)];

    if (screen === Screen.GALLERY && !selectedCat) {
      const urls2 = [
        "/assets/soundblocks/bowltest_scene.json",
        "/assets/soundblocks/kalimba_piano_scene.json",
        "/assets/soundblocks/kalimba_piano_scene1.json",
        "/assets/soundblocks/kalimba_piano_scene3.json",
        "/assets/soundblocks/kalimba_piano_scene4.json",
      ];
      url = urls2[Math.floor(Math.random() * urls2.length)];
    }

    if (screen !== Screen.GALLERY && selectedCat === "Dovcenko2 (2022)") {
      const arsenalUrls = ["/assets/soundblocks/arsenal_scene.json", "/assets/soundblocks/test_scene.json"];
      url = arsenalUrls[Math.floor(Math.random() * arsenalUrls.length)];
    }

    // Override for testing
    url = "/assets/soundblocks/atellier_zukunft_scene.json";

    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.status}`);
      }
      const data = await response.json();
      console.log(`App: Loaded ${data.length} sound blocks for ${screen.toString()}`);
      setAudioBlocks(data);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    } finally {
      setLoading(false);
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
    console.log(selectedCat);

    setSelectedCat(category);
    setSelectedScreen(Screen.GALLERY);
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

            {blocks.length > 0 && <ToneMusicSystem onLoadingChange={setLoading} play={isPlaying} blocks={blocks} verbose={verbose} fadeDuration={1.5} />}
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
    </GalleryContextProvider>
  );
}

function App() {
  return (
    <ToneMusicProvider initialVerbose={true}>
      <AppContent />
    </ToneMusicProvider>
  );
}

export default App;
