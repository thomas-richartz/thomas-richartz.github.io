import React, { useState } from 'react';
import { BottomBar } from './components/BottomBar';
import { HeaderBar } from './components/HeaderBar';
import { GalleryCatScreen } from './screens/GalleryCatScreen';

import { GalleryScreen } from './screens/GalleryScreen';
import { LandingScreen } from './screens/LandingScreen';

function App() {

  const [selectedScreen, setSelectedScreen] = useState<string>("landing");
  // const [selectedScreen, setSelectedScreen] = useState<string>("landing");
  const [selectedCat, setSelectedCat] = useState<string>("");

  const onNavigate = (screen:string) => {
    setSelectedScreen(screen);
  }

  let screen:JSX.Element;

  if (selectedScreen === "landing") {
    screen = <LandingScreen onCatClick={(cat:string) => setSelectedCat(cat)}  onNavigate={onNavigate} />
  } else if (selectedScreen === "gallery") {
    screen = <GalleryScreen onCatClick={(cat:string) => setSelectedCat(cat)}  onNavigate={onNavigate} />
  } else {
    screen = <GalleryCatScreen cat={selectedCat}  onClick={(cat:string) => setSelectedCat(cat)} />
  }

  return (
    <div>
      <HeaderBar />
      <main>
      {screen}
      <BottomBar onNavigate={onNavigate} selectedScreen={selectedScreen} />
      </main>
    </div>
  );
}

export default App;
