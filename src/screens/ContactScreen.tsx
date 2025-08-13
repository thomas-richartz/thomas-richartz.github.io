import React, { useEffect, useState } from "react";
import { Screen } from "@/enums";
import styles from "./ContactScreen.module.css";
import { Paragraph } from "@/components/Paragraph";
import { BadgeIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
// import ToneMusicOverlay from "@/components/ToneMusicSystemOverlay";
import { InterpretationsPageScreen } from "./IntepretationsPageScreen";

type ContactScreenProps = {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
  onSearch: () => void; // Triggered when the search button is clicked
};

export const ContactScreen = ({ onCatClick, onNavigate, onSearch }: ContactScreenProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);
  const [isControlsHidden, setIsControlsHidden] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsHidden(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleControls = () => {
    setIsControlsHidden(!isControlsHidden);
  };

  return (
    <div className={`${styles.screenContainer} ${isHidden ? styles.hidden : ""}`}>
      {/*<div className={styles.Controls}>
        <ToneMusicOverlay />
      </div>*/}
      {isControlsHidden ? null : (
        <div className={styles.Controls}>
          <InterpretationsPageScreen onClose={toggleControls} />
        </div>
      )}
      <Paragraph
        children={<>Copyright by Thomas Richartz, Mainz. Verantworlich i.S.d.P:</>}
        links={[
          {
            href: "https://thomas-richartz.com",
            text: "Thomas Richartz",
          },
        ]}
      />

      <Paragraph
        children={<>About</>}
        links={[
          {
            href: "https://thomas-richartz.com",
            text: "Photographs and Images are licensed under ",
          },
          {
            href: "https://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1",
            text: "CC BY-ND 4.0",
            imgSrc: "https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1",
            imgAlt: "CC",
          },
        ]}
      />
      <Paragraph
        children={<>Videos</>}
        links={[
          {
            href: "https://www.youtube.com/@thomasrichartz6276",
            text: "YouTube",
          },
        ]}
      />
      <Paragraph
        children={
          <>
            <button className={styles.button} onClick={toggleControls}>
              <BadgeIcon color="#dce" />
            </button>
          </>
        }
      />
      <Paragraph
        children={
          <>
            <button className={styles.button} onClick={onSearch}>
              <MagnifyingGlassIcon color="#cde" />
            </button>
          </>
        }
      />
    </div>
  );
};
