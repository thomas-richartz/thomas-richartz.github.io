import React, { useEffect, useMemo, useState } from "react";
import { allImages } from "../assets/assets";
import { categoryDescriptions } from "../assets/resurrection";
import { LazyLoadImage } from "../components/LazyLoadImage";
import { LightBoxImage } from "../components/LightBoxImage";
import styles from "./GalleryCatScreen.module.css";
import { GalleryImage } from "../types";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { useDrag } from "@use-gesture/react";

type GalleryCatScreenProps = {
  cat: string;
  onClick: (cat: string) => void;
};

export const GalleryCatScreen = ({
  cat,
}: GalleryCatScreenProps): JSX.Element => {
  const [hide, setHide] = useState<boolean>(true);
  const [showImage, setShowImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const images = useMemo(() => {
    const filtered = allImages.filter((image) => image.cat === cat);
    return filtered;
  }, [cat]);

  const updateImage = (index: number) => {
    const validIndex = (index + images.length) % images.length;
    setCurrentIndex(validIndex);
    setShowImage(images[validIndex]);
  };

  const showNextImage = () => {
    if (currentIndex === null) return;
    updateImage(currentIndex + 1);
  };

  const showPrevImage = () => {
    if (currentIndex === null) return;
    updateImage(currentIndex - 1);
  };

  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.code) {
      case "ArrowLeft":
        showPrevImage();
        break;
      case "ArrowRight":
        showNextImage();
        break;
      case "Escape":
        setShowImage(null);
        setCurrentIndex(null);
        break;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setHide(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const bindGesture = useDrag(
    ({ down, movement: [mx], velocity: [vx] }) => {
      if (!down && Math.abs(vx) > 0.5) {
        if (mx < 0) {
          showNextImage();
        } else {
          showPrevImage();
        }
      }
    },
    { axis: "x" },
  );

  const desc = categoryDescriptions[cat] || "";

  return (
    <>
      {/* Introductory paragraph */}
      <div className={styles.galleryCatScreen__introText}>
        <div>
          <strong>{cat}</strong>
          <div>{desc}</div>
        </div>
      </div>

      <div
        className={styles.galleryCatScreen__imageWrapper}
        onKeyDown={keyDownHandler}
        tabIndex={0}
      >
        {images.map((image, index) => (
          <article
            key={index}
            className={styles.galleryCatScreen__image}
            onClick={() => {
              setShowImage(image);
              setCurrentIndex(index);
            }}
          >
            <div className={styles.galleryCatScreen__kenBurnsWrapper}>
              <LazyLoadImage
                alt={image.title}
                className={styles.galleryCatScreen__imageImg}
                src={`assets/images/${image.filename}`}
              />
            </div>
          </article>
        ))}

        {/* Lightbox for selected image */}
        {showImage && (
          <div
            className={styles.galleryCatScreen__lightBoxOverlay}
            {...bindGesture()}
          >
            <button
              className={`${styles.galleryCatScreen__button} ${styles.galleryCatScreen__buttonLeft}`}
              onClick={showPrevImage}
            >
              <ChevronLeftIcon />
            </button>
            <LightBoxImage
              alt={showImage.title}
              src={`assets/images/${showImage.filename}`}
              className={styles.galleryCatScreen__lightBoxImage}
              onClick={() => setShowImage(null)}
            />
            <div className={styles.galleryCatScreen__imageOverlay}>
              <h2 className={styles.galleryCatScreen__imageTitle}>
                {showImage.title}
              </h2>
            </div>

            <button
              className={`${styles.galleryCatScreen__button} ${styles.galleryCatScreen__buttonRight}`}
              onClick={showNextImage}
            >
              <ChevronRightIcon />
            </button>
            <button
              className={styles.galleryCatScreen__closeButton}
              onClick={() => {
                setShowImage(null);
                setCurrentIndex(null);
              }}
            >
              <Cross2Icon />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
