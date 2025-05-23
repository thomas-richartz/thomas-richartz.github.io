import React, { useState, useEffect } from "react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { GalleryContextProvider } from "@/context/GalleryContext";
import { Screen } from "@/enums";
import { GalleryCatScreen } from "@/screens/GalleryCatScreen";
import { GalleryScreen } from "@/screens/GalleryScreen";
import { LandingScreen } from "@/screens/LandingScreen";
import styles from "@/App.module.css";
import { BottomBar } from "@/components/BottomBar";
import { ContactScreen } from "@/screens/ContactScreen";
import MusicSystem from "@/components/MusicSystem";
import { FileSoundBlock } from "@/audio/FileSoundBlock";

function App() {
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocks, setBlocks] = useState<FileSoundBlock[]>([]);
  const [verbose, setVerbose] = useState(false);
  // const [verbose, setVerbose] = useState(true);

  useEffect(() => {
    // Fetch sound blocks
    const fetchBlocks = async () => {
      try {
        const response = await fetch(
          "/assets/soundblocks/kalimba_piano_scene.json",
        );
        const data = await response.json();
        setBlocks(data);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };

    fetchBlocks();
  }, []);

  const onNavigate = (screen: Screen) => {
    setSelectedScreen(screen);
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
              <LandingScreen
                onCatClick={(cat) => setSelectedCat(cat)}
                onNavigate={onNavigate}
              />
            ) : selectedScreen === Screen.GALLERY ? (
              <GalleryScreen
                onCatClick={(cat) => setSelectedCat(cat)}
                onNavigate={onNavigate}
              />
            ) : selectedScreen === Screen.CONTACT ? (
              <ContactScreen
                onCatClick={(cat) => setSelectedCat(cat)}
                onNavigate={onNavigate}
                onSearch={handleSearchOpen}
              />
            ) : (
              <GalleryCatScreen
                cat={selectedCat}
                onClick={(cat) => setSelectedCat(cat)}
              />
            )}
            <MusicSystem play={isPlaying} blocks={blocks} verbose={verbose} />
            <BottomBar
              onNavigate={onNavigate}
              selectedScreen={selectedScreen}
              onSearch={handleSearchOpen}
              onMusicToggle={() => setIsPlaying((prev) => !prev)}
              isPlaying={isPlaying}
            />
          </>
          {isSearchVisible && (
            <SearchOverlay
              items={images}
              isLoading={isLoadingImages}
              onClose={handleSearchClose}
              onItemSelect={handleItemSelect}
            />
          )}
        </main>
      </div>
    </GalleryContextProvider>
  );
}

export default App;
