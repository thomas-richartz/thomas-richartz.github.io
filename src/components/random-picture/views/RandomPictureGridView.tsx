import React, { useState, useCallback, useMemo } from "react";
import { useDrag } from "@use-gesture/react";
import { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureGridView.module.css";

interface ViewProps {
  images: GalleryImage[];
}

export const RandomPictureGridView = ({ images }: ViewProps) => {
  const [showIndex, setShowIndex] = useState<number | null>(null);

  const memoImages = useMemo(() => images, [images]);

  const handleImageClick = (index: number) => setShowIndex(index);
  const handleClose = () => setShowIndex(null);

  const showNextImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev + 1) % memoImages.length : null));
  }, [memoImages.length]);

  const showPrevImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev - 1 + memoImages.length) % memoImages.length : null));
  }, [memoImages.length]);

  const bindGesture = useDrag(
    ({ down, movement: [mx], velocity: [vx] }) => {
      if (!down && Math.abs(vx) > 0.2) {
        if (mx < 0) showNextImage();
        else showPrevImage();
      }
    },
    { axis: "x" },
  );

  return (
    <>
      <div className={styles.gridContainer}>
        {memoImages.map((image, index) => (
          <div
            key={index}
            className={styles.gridItem}
            tabIndex={0}
            role="button"
            onClick={() => handleImageClick(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleImageClick(index);
            }}
            aria-label={`Open image ${image.title}`}
          >
            <IntenseImage
              alt={image.title}
              title={image.title}
              src={`/assets/images/${image.filename}`}
              nextImage={showNextImage}
              prevImage={showPrevImage}
              onClose={handleClose}
              isOpen={false}
            />
            {/* <img src={`assets/images/${image.filename}`} alt={image.title} title={image.title} className={styles.gridThumbImg} loading="lazy" /> */}
          </div>
        ))}
      </div>

      {/* Overlay: IntenseImage with swipe and fullscreen support */}
      {showIndex !== null && (
        <div {...bindGesture()} tabIndex={-1}>
          <IntenseImage
            alt={memoImages[showIndex].title}
            title={memoImages[showIndex].title}
            src={`assets/images/${memoImages[showIndex].filename}`}
            nextImage={showNextImage}
            prevImage={showPrevImage}
            onClose={handleClose}
            isOpen
          />
        </div>
      )}
    </>
  );
};
