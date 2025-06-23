import * as Tone from "tone";
import { useState, useEffect, useCallback } from "react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { GalleryContextProvider } from "@/context/GalleryContext";
import { Screen } from "@/enums";
import { GalleryCatScreen } from "@/screens/GalleryCatScreen";
import { GalleryScreen } from "@/screens/GalleryScreen";
import { LandingScreen } from "@/screens/LandingScreen";
import styles from "@/App.module.css";
import { BottomBar } from "@/components/BottomBar";
import { ContactScreen } from "@/screens/ContactScreen";
import { FileSoundBlock, ToneMusicScene } from "@/audio/ToneMusicScene";
import ToneMusicSystem from "./components/ToneMusicSystem";
import { useRef } from "react";

function App() {
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocks, setBlocks] = useState<FileSoundBlock[]>([]);
  // const [verbose, setVerbose] = useState(false);
  const [verbose, setVerbose] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentSceneRef = useRef<ToneMusicScene | null>(null);

  // const handleMusicToggle = useCallback(async () => {
  //   if (Tone.context.state !== "running") {
  //     await Tone.start();
  //   }
  //   setIsPlaying((prev) => !prev);
  // }, []);

  const handleMusicToggle = useCallback(async () => {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    setIsPlaying((prev) => !prev);
    // If turning OFF music, fade out and stop scene
    if (isPlaying && currentSceneRef.current) {
      await currentSceneRef.current.fadeOut?.(2);
      currentSceneRef.current.stop();
    }
    // If turning ON, fade in current scene (if any)
    if (!isPlaying && currentSceneRef.current) {
      await currentSceneRef.current.fadeIn?.(2);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (screen === Screen.LANDING) {
      const fetchBlocks = async () => {
        try {
          const response = await fetch("/assets/soundblocks/kalimba_piano_scene.json");
          const data = await response.json();
          setBlocks(data);
          // Create and fade in initial scene if auto-play
          if (isPlaying) {
            currentSceneRef.current = await ToneMusicScene.transitionToScene(
              currentSceneRef.current,
              data,
              true, // reverb
              true, // delay
              2, // fade duration
            );
          }
        } catch (error) {
          console.error("Error fetching blocks:", error);
        }
      };
      fetchBlocks();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, []);

  const onNavigate = async (screen: Screen) => {
    setSelectedScreen(screen);
    // Fetch blocks for the new screen
    let url = "/assets/soundblocks/kalimba_piano_scene.json";
    console.log(selectedCat);
    if (screen === Screen.GALLERY_CAT && selectedCat === "Dovcenko2 (2022)") {
      url = "/assets/soundblocks/arsenal_scene.json";
    }
    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();
      setBlocks(data);

      if (isPlaying) {
        currentSceneRef.current = await ToneMusicScene.transitionToScene(currentSceneRef.current, data, true, true, 2);
      } else if (currentSceneRef.current) {
        currentSceneRef.current.stop();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching blocks:", error);
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
            {blocks.length > 0 && <ToneMusicSystem onLoadingChange={setLoading} play={isPlaying} blocks={blocks} verbose={verbose} />}
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

export default App;
