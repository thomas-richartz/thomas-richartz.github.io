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
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsHidden(false), 800);
    const generateMailtoUrl = () => {
      const username = "thomas.richartz.com";
      const domain = "gmail.com";
      setEmail(`mailto:${username}@${domain}`);
    };

    generateMailtoUrl();
    return () => clearTimeout(timer);
  }, []);

  const toggleControls = () => {
    setIsControlsHidden(!isControlsHidden);
  };

  return (
    <div className={`${styles.screenContainer} ${isHidden ? styles.hidden : ""}`}>
      {isControlsHidden ? null : (
        <div className={styles.Controls}>
          {/*Administrative*/}
          {/* tabs? */}
          {/*<ToneMusicOverlay />*/}
          <InterpretationsPageScreen onClose={toggleControls} />
        </div>
      )}
      <Paragraph>
        <h2>Contact</h2>
        <p>Copyright by Thomas Richartz, Mainz.</p>
        Feel free to reach out to me at {email && <a href={email}>thomas.richartz.com at gmail.com</a>}
      </Paragraph>

      <Paragraph
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
      >
        <h2>About</h2>
      </Paragraph>

      <Paragraph
        links={[
          {
            href: "https://www.youtube.com/@thomasrichartz6276",
            text: "YouTube",
          },
        ]}
      >
        <h2>Social</h2>
      </Paragraph>
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
