import React, { useEffect, useState } from "react";
import { RandomPictureViewer } from "../components/RandomPictureViewer";
import { Screen } from "../enums";
import styles from "./LandingScreen.module.css";
import { TextFx } from "../components/TextFx";

interface ILandingScreen {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
}

export const LandingScreen = ({
  onCatClick,
  onNavigate,
}: ILandingScreen): JSX.Element => {
  const [hide, setHide] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setHide(false);
    }, 800);
  }, []);

  const essayList = [
    "Meine Hauptanstrengung galt immer dem Erlernen der handwerklichen Fähigkeiten zur Entwicklung meiner Kunst.",
    "Meine Bemühungen galten stets dem Entwickeln einer unzeitgenössischen Kunst.",
    "Mein Ideal blieb immer eine zeit-übergreifende Kunst.",
    "„Metakunst“ zum Wohle Aller!",
  ];

  return (
    <div
      className={`${styles.fadeStyles} ${hide ? styles.fadeStylesHidden : ""}`}
    >
      <div
        className={styles.gallerySliderWrap}
        onClick={() => onNavigate(Screen.GALLERY)}
        style={{ cursor: "pointer" }}
      >
        <img
          className={`${styles.centeredImage} ${styles.imageProfile}`}
          src="/assets/img/thomas-richartz.jpg"
          alt="thomas-richartz"
        />
        <h1 className={styles.landingHeadline}>Thomas Richartz</h1>
        <h2
          className={styles.underHeadline}
          style={{ textAlign: "center", margin: "auto" }}
        >
          <TextFx>
            {essayList[Math.floor(Math.random() * essayList.length)]}
          </TextFx>
        </h2>
      </div>
      <RandomPictureViewer />
    </div>
  );
};
