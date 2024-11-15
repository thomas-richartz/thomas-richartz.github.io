import React from 'react';
import { BottomBar } from './components/BottomBar';
import { GalleryContextProvider } from './context/GalleryContext';
import { Screen } from './enums';
import { GalleryCatScreen } from './screens/GalleryCatScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { LandingScreen } from './screens/LandingScreen';
import styles from "./App.module.css";
 

function App() {
  const [selectedScreen, setSelectedScreen] = React.useState<Screen>(Screen.LANDING);
  const [selectedCat, setSelectedCat] = React.useState<string>("");

  const onNavigate = (screen: Screen) => {
    setSelectedScreen(screen);
  };

  let screen: JSX.Element;

  if (selectedScreen === Screen.LANDING) {
    screen = <LandingScreen onCatClick={(cat: string) => setSelectedCat(cat)} onNavigate={onNavigate} />;
  } else if (selectedScreen === Screen.GALLERY) {
    screen = <GalleryScreen onCatClick={(cat: string) => setSelectedCat(cat)} onNavigate={onNavigate} />;
  } else {
    screen = <GalleryCatScreen cat={selectedCat} onClick={(cat: string) => setSelectedCat(cat)} />;
  }

  return (
    <GalleryContextProvider>
      <div tabIndex={0}>
        <main className={styles.warehouseWrap}>
          <>
            {screen}
            <BottomBar onNavigate={onNavigate} selectedScreen={selectedScreen} />
          </>
        </main>
      </div>
    </GalleryContextProvider>
  );
}

export default App;
