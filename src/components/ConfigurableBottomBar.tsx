import React from "react";
import { Screen } from "@/enums";
import {
  HomeIcon,
  ImageIcon,
  PersonIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  GridIcon,
} from "@radix-ui/react-icons";
import styles from "./BottomBar.module.css";
import { useRouter, RouteConfig } from "@/context/RouterContext";

interface ConfigurableBottomBarProps {
  onSearch: () => void;
  onMusicToggle: () => void;
  isPlaying: boolean;
}

// Map of icon names to components
const iconMap: Record<string, React.ReactNode> = {
  Home: <HomeIcon color="#cde" />,
  Image: <ImageIcon color="#cde" />,
  Person: <PersonIcon color="#cde" />,
  Grid: <GridIcon color="#cde" />,
};

export const ConfigurableBottomBar = ({
  onSearch,
  onMusicToggle,
  isPlaying
}: ConfigurableBottomBarProps): JSX.Element => {
  const { navigateTo, currentScreen, getVisibleRoutes } = useRouter();

  const visibleRoutes = getVisibleRoutes();

  // Get the current year for copyright
  const currentYear = new Date().getFullYear();

  // Function to render the appropriate icon based on route configuration
  const renderIcon = (route: RouteConfig) => {
    return iconMap[route.iconName] || <HomeIcon color="#cde" />;
  };

  return (
    <div className={styles.bottomBar}>
      {/* Music Toggle Icon */}
      <button className={`${styles.button} ${styles.paddingLeft}`} onClick={onMusicToggle}>
        {isPlaying ? (
          <SpeakerLoudIcon color="#cde" />
        ) : (
          <SpeakerOffIcon color="#cde" />
        )}
      </button>

      {/* Navigation Buttons */}
      <div className={styles.centerButton}>
        {visibleRoutes.map((route) => (
          <button
            key={route.id}
            className={`${styles.button} ${currentScreen === route.screenType ? styles.active : ''}`}
            onClick={() => navigateTo(route.screenType as Screen)}
          >
            {renderIcon(route)}
          </button>
        ))}
      </div>

      {/* Copyright text that navigates to contact page */}
      <span
        onClick={() => navigateTo(Screen.CONTACT)}
        className={`${styles.footerText} ${styles.paddingRight}`}
      >
        &copy; Thomas Richartz {currentYear}
      </span>
    </div>
  );
};
