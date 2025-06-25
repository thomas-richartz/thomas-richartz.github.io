import React, { useCallback, useMemo, useState } from "react";
import { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureListView.module.css";

interface IRandomPictureListView {
  images: GalleryImage[];
}

export const RandomPictureListView = ({ images }: IRandomPictureListView): JSX.Element => {
  const [showIndex, setShowIndex] = useState<number | null>(null);
  const memoImages = useMemo(() => images, [images]);

  // For grid: open overlay on click
  const handleImageClick = (index: number) => setShowIndex(index);
  const handleClose = () => setShowIndex(null);

  // Overlay navigation
  const showNextImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev + 1) % memoImages.length : null));
  }, [memoImages.length]);

  const showPrevImage = useCallback(() => {
    setShowIndex((prev) => (prev !== null ? (prev - 1 + memoImages.length) % memoImages.length : null));
  }, [memoImages.length]);

  return (
    <>
      <div className={styles.listImagesWrapper}>
        <div className={styles.listContainer}>
          {memoImages.map((image, index) => (
            <div
              key={`${image.title}-${index}`}
              className={styles.imageContainer}
              tabIndex={0}
              onClick={() => handleImageClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleImageClick(index);
              }}
              aria-label={`Open image ${image.title}`}
              role="button"
            >
              {/* <img alt={image.title} title={image.title} src={`/assets/images/${image.filename}`} className={styles.figureKenBurns} loading="lazy" /> */}

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
          isOpen // always open in overlay
        />
      )}
    </>
  );
};
