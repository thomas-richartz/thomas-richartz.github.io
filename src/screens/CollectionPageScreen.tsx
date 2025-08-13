import React, { useEffect, useMemo, useState } from "react";
import { allImages } from "@/assets/assets";
import { categoryDescriptions } from "@/assets/resurrection";
import { LazyLoadImage } from "@/components/LazyLoadImage";
import { LightBoxImage } from "@/components/LightBoxImage";
import styles from "./CollectionPageScreen.module.css";
import galleryStyles from "./GalleryScreen.module.css";
import { categoryInterpretations, imageInterpretations } from "@/assets/interpretations";

import { GalleryImage } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useDrag } from "@use-gesture/react";
import { convertMarkdownToHtml } from "@/utils/textUtils";

type GalleryCatScreenProps = {
  cat: string;
  onClick: (cat: string) => void;
};

function renderIntepretation(text: string) {
  const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(escapedText) }} />;
}

export const GalleryCatScreen = ({ cat }: GalleryCatScreenProps): JSX.Element => {
  const [hide, setHide] = useState<boolean>(true);
  const [showImage, setShowImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const categoryInterpretation = categoryInterpretations[cat];
  const hasInterpretation = !!categoryInterpretation;

  const [showInterpretation, setShowInterpretation] = useState(false);

  const images = useMemo(() => {
    const filtered = allImages.filter((image) => image.cat === cat);
    // each keyPiece takes up three spaces
    // let remainder = filtered.length % 3;
    // remainder -= filtered.filter((img) => img.keyPiece).length * 2;
    let totalSpacesNeeded = filtered.length;

    filtered.forEach((img) => {
      if (img.keyPiece) {
        totalSpacesNeeded += 2;
      }
    });

    let remainder = totalSpacesNeeded % 3;

    if (remainder < 0) remainder = 0;
    if (remainder === 0 || filtered.length === 0) return filtered;

    const padCount = 3 - remainder;
    let padded = [...filtered];

    for (let i = 0; i < padCount; i++) {
      padded.push(filtered[i % filtered.length]);
    }
    return padded;
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

  function renderParallaxTexts() {
    return (
      <div className={styles.galleryCatScreen__parallaxText}>
        {Object.entries(categoryInterpretations).map(([title, text], i) => (
          <p key={i}>{renderIntepretation(text)}</p>
        ))}
      </div>
    );
  }

  const desc = categoryDescriptions[cat] || "";

  return (
    <>
      {/* Introductory paragraph */}
      <div className={styles.galleryCatScreen__introText}>
        <div>
          <strong>{cat}</strong>
          <div className={`${styles.galleryCatScreen__introTextContent} ${!hide ? styles.galleryCatScreen__introTextContentShow : ""}`}>{desc}</div>
        </div>
      </div>

      <div className={styles.galleryCatScreen__imageWrapper} onKeyDown={keyDownHandler} tabIndex={0}>
        {images.map((image, index) => {
          const isKey = image.keyPiece;
          const itemClass = `${styles.galleryCatScreen__image} ${
            isKey ? styles.galleryCatScreen__imageKeyPiece : ""
          } ${index % 2 === 0 ? galleryStyles.galleryItemEven : galleryStyles.galleryItemOdd}`;

          return (
            <article
              itemScope
              itemType="https://schema.org/CreativeWork"
              key={index}
              className={itemClass}
              onClick={() => {
                setShowImage(image);
                setCurrentIndex(index);
              }}
            >
              <div className={styles.galleryCatScreen__kenBurnsWrapper}>
                <LazyLoadImage alt={image.title} className={styles.galleryCatScreen__imageImg} src={`assets/images/${image.filename}`} />
              </div>
            </article>
          );
        })}

        {/* Lightbox for selected image */}
        {showImage && (
          <div className={styles.galleryCatScreen__lightBoxOverlay} {...bindGesture()}>
            <button className={`${styles.galleryCatScreen__button} ${styles.galleryCatScreen__buttonLeft}`} onClick={showPrevImage}>
              <ChevronLeftIcon />
            </button>
            {showInterpretation && (
              <div
                className={styles.infoPanel}
                style={{
                  display: "flex",
                }}
              >
                {categoryInterpretation && renderParallaxTexts(categoryInterpretation)}
                {categoryInterpretation && (
                  <div>
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>{cat}</div>
                    <div style={{ marginBottom: 12 }}>{renderIntepretation(categoryInterpretation)}</div>
                  </div>
                )}
                {/* {imageInterpretation && (
                  <div>
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>{title}</div>
                    <div>{imageInterpretation}</div>
                  </div>
                )} */}
              </div>
            )}
            <LightBoxImage
              alt={showImage.title}
              src={`assets/images/${showImage.filename}`}
              className={styles.galleryCatScreen__lightBoxImage}
              onClick={() => setShowImage(null)}
            />
            <div className={styles.galleryCatScreen__imageOverlay}>
              <h2 className={styles.galleryCatScreen__imageTitle}>{showImage.title}</h2>
            </div>

            <button className={`${styles.galleryCatScreen__button} ${styles.galleryCatScreen__buttonRight}`} onClick={showNextImage}>
              <ChevronRightIcon />
            </button>

            {/* INTERPRETATION ICON & POPOVER */}
            {hasInterpretation && (
              <button
                className={styles.galleryCatScreen__infoButton}
                aria-label="Show interpretation"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInterpretation((v) => !v);
                }}
                style={{
                  display: "inline-flex",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <circle cx="12" cy="8" r="1" />
                </svg>
              </button>
            )}

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
