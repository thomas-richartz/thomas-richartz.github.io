import { useEffect, useState } from "react";
import { Screen } from "../enums";
import styles from "./ContactScreen.module.css";
import { Paragraph } from "../components/Paragraph";

type ContactScreenProps = {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
};

export const ContactScreen = ({
  onCatClick,
  onNavigate,
}: ContactScreenProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsHidden(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`${styles.screenContainer} ${isHidden ? styles.hidden : ""}`}
    >
      <Paragraph
        children={
          <>Copyright by Thomas Richartz, Mainz. Verantworlich i.S.d.P:</>
        }
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
            imgSrc:
              "https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1",
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
    </div>
  );
};
