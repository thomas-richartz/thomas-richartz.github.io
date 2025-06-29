// import React, { useState } from "react";
import { Screen } from "@/enums";
import {
  HomeIcon,
  ImageIcon,
  // MagnifyingGlassIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";
import styles from "./BottomBar.module.css";

interface BottomBarProps {
  onNavigate: (screen: Screen) => void;
  selectedScreen: Screen;
  onSearch: () => void; // Triggered when the search button is clicked
  onMusicToggle: () => void;
  isPlaying: boolean;
  setShowToneOverlay: (show: boolean) => void;
}

export const BottomBar = ({ onNavigate, selectedScreen, onSearch, onMusicToggle, isPlaying, setShowToneOverlay }: BottomBarProps): JSX.Element => {
  const isGalleryScreen = selectedScreen === Screen.GALLERY;
  const parentScreen = isGalleryScreen ? Screen.LANDING : Screen.GALLERY;

  const editMode = false;

  return (
    <div className={styles.bottomBar}>
      {/* Search Icon */}
      {/*<button className={styles.button} onClick={onSearch}>*/}
      {/*  <MagnifyingGlassIcon color="#cde"/>*/}
      {/*</button>*/}

      {/* Music Toggle Icon */}
      <button className={`${styles.button} ${styles.paddingLeft}`} onClick={onMusicToggle}>
        {isPlaying ? (
          <>
            <SpeakerLoudIcon color="#cde" />
          </>
        ) : (
          <SpeakerOffIcon color="#cde" />
        )}
      </button>
      {isPlaying && editMode && (
        <button className={`${styles.button} ${styles.settingsButton} ${styles.footerText}`} onClick={() => setShowToneOverlay(true)} style={{ margin: 2 }}>
          Audio Settings
        </button>
      )}
      {/* Home/Gallery Icon in the center */}
      <button className={`${styles.button} ${styles.centerButton}`} onClick={() => onNavigate(parentScreen)}>
        {isGalleryScreen ? <HomeIcon color="#cde" /> : <ImageIcon color="#cde" />}
      </button>

      <span onClick={() => onNavigate(Screen.CONTACT)} className={`${styles.footerText} ${styles.paddingRight}`}>
        &copy; Thomas Richartz 2025
      </span>
    </div>
  );
};
