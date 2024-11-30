import React, {useState} from "react";
import {SearchOverlay} from "./components/SearchOverlay";
import {GalleryContextProvider} from "./context/GalleryContext";
import {Screen} from "./enums";
import {GalleryCatScreen} from "./screens/GalleryCatScreen";
import {GalleryScreen} from "./screens/GalleryScreen";
import {LandingScreen} from "./screens/LandingScreen";
import styles from "./App.module.css";
import {BottomBar} from "./components/BottomBar";
import {ContactScreen} from "./screens/ContactScreen";
import MusicSystem from "./components/MusicSystem";
import {SoundBlock} from "./audio/SoundBlock";

function App() {
  const [selectedScreen, setSelectedScreen] = useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [isSearchVisible, setSearchVisible] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]); // Initially empty
  const [isLoadingImages, setLoadingImages] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // const darkDystopianScale = [55, 110, 165, 220, 261.63, 311.13, 392];
   const blocks: SoundBlock[] = [
    {
      name: "wavLoop",
      pattern: "sampleAndHold",
      scale: [55, 110, 165, 220, 261.63, 311.13, 392],
      filePath: "/assets/wav/kalimba_gb_prt2.wav",
      duration: 10,
      reverb: true,
      volume: 0.8,
      loop: true,
      playbackRate: 1.0,
    },
  ];


  const onNavigate = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  const handleSearchOpen = async () => {
    if (images.length === 0) {
      setLoadingImages(true);
      // Dynamically load `allImages` when search is triggered
      const {allImages} = await import("./assets/assets");
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
              />
            ) : (
              <GalleryCatScreen
                cat={selectedCat}
                onClick={(cat) => setSelectedCat(cat)}
              />
            )}
            <MusicSystem play={isPlaying} blocks={blocks}/>
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
