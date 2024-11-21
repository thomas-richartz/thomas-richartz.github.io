import React, { useState } from "react";
import { Screen } from "../enums";
import {
  HomeIcon,
  ImageIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import styles from "./BottomBar.module.css";

interface BottomBarProps {
  onNavigate: (screen: Screen) => void;
  selectedScreen: Screen;
  onSearch: () => void; // Triggered when the search button is clicked
}

export const BottomBar = ({
  onNavigate,
  selectedScreen,
  onSearch,
}: BottomBarProps): JSX.Element => {
  const isGalleryScreen = selectedScreen === Screen.GALLERY;
  const parentScreen = isGalleryScreen ? Screen.LANDING : Screen.GALLERY;

  return (
    <div className={styles.bottomBar}>
      {/* Search Icon */}
      <button className={styles.button} onClick={onSearch}>
        <MagnifyingGlassIcon color="#cde" />
      </button>

      {/* Home/Gallery Icon in the center */}
      <button
        className={`${styles.button} ${styles.centerButton}`}
        onClick={() => onNavigate(parentScreen)}
      >
        {isGalleryScreen ? (
          <HomeIcon color="#cde" />
        ) : (
          <ImageIcon color="#cde" />
        )}
      </button>

      <span
        onClick={() => onNavigate(Screen.CONTACT)}
        className={styles.footerText}
      >
        &copy; Thomas Richartz 2024
      </span>
    </div>
  );
};
