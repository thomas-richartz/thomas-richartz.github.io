import React, { useCallback, useMemo, useState, useEffect } from "react";
import { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureListView.module.css";

interface IRandomPictureListView {
  images: GalleryImage[];
}

export const RandomPictureListView = ({ images }: IRandomPictureListView): JSX.Element => {
  const [showIndex, setShowIndex] = useState<number | null>(null);
  const memoImages = useMemo(() => images, [images]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // For grid: open overlay on click
  const handleImageClick = (index: number) => {
    setShowIndex(index);
    setFocusedIndex(index);
  };

  const handleClose = () => {
    setShowIndex(null);
    setFocusedIndex(null);
  };

  // Overlay navigation
  const showNextImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev + 1) % memoImages.length : null));
  }, [memoImages.length]);

  const showPrevImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev - 1 + memoImages.length) % memoImages.length : null));
  }, [memoImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && focusedIndex !== null) {
        setFocusedIndex((prev) => (prev - 1 + memoImages.length) % memoImages.length);
      } else if (e.key === "ArrowDown" && focusedIndex !== null) {
        setFocusedIndex((prev) => (prev + 1) % memoImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [memoImages.length, focusedIndex]);

  return (
    <>
      <div className={styles.listImagesWrapper}>
        <div className={styles.listContainer}>
          {memoImages.map((image, index) => (
            <div
              key={`${image.title}-${index}`}
              className={styles.imageContainer}
              tabIndex={Number(index)}
              onClick={() => handleImageClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleImageClick(index);
              }}
              aria-label={`Open image ${image.title}`}
              role="button"
            >
              <IntenseImage
                alt={image.title}
                title={image.title}
                category={image.cat}
                src={`/assets/images/${image.filename}`}
                nextImage={showNextImage}
                prevImage={showPrevImage}
                onClose={handleClose}
                isOpen={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Only one IntenseImage for overlay/fullscreen */}
      {showIndex !== null && (
        <IntenseImage
          alt={memoImages[showIndex].title}
          title={memoImages[showIndex].title}
          category={memoImages[showIndex].cat}
          src={`/assets/images/${memoImages[showIndex].filename}`}
          nextImage={showNextImage}
          prevImage={showPrevImage}
          onClose={handleClose}
          isOpen={true} // always open in overlay
        />
      )}
    </>
  );
};
