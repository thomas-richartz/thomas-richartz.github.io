import { useEffect, useMemo, useRef, useState } from "react";
import { allImages } from "@/assets/assets";
import { Screen } from "@/enums";
// import { GalleryImage } from "@/types";
import styles from "./GalleryScreen.module.css";

type GalleryScreenProps = {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
};

export const GalleryScreen = ({
  onCatClick,
  onNavigate,
}: GalleryScreenProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);
  const catRefs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsHidden(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const sortedImagesByCatAndRange = useMemo(() => {
    return [...allImages]
      .sort((a, b) => (a.cat < b.cat ? -1 : 1))
      .sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1));
  }, []);

  const uniqueCategoryImages = useMemo(() => {
    const seenCategories = new Set<string>();
    return sortedImagesByCatAndRange.filter((image) => {
      if (seenCategories.has(image.cat)) return false;
      seenCategories.add(image.cat);
      return true;
    });
  }, [sortedImagesByCatAndRange]);

  const handleImageClick = (category: string) => {
    setIsHidden(true);
    setTimeout(() => {
      onCatClick(category);
      onNavigate(Screen.GALLERY_CAT);
    }, 800);
  };

  return (
    <div
      className={`${styles.galleryContainer} ${isHidden ? styles.hidden : ""}`}
    >
      {uniqueCategoryImages.map((image, index) => (
        <article
          key={`${image.cat}-${image.filename}`}
          className={`${styles.galleryItem} ${
            index % 2 === 0 ? styles.galleryItemEven : styles.galleryItemOdd
          }`}
          onClick={() => handleImageClick(image.cat)}
        >
          <h2 className={styles.galleryItemTitle}>{image.cat}</h2>
          <div className={styles.galleryImageWrapper}>
            <img
              alt={image.title}
              ref={(el) => {
                if (el) catRefs.current.push(el);
              }}
              className={styles.galleryImage}
              src={`assets/images/${image.filename}`}
            />
          </div>
        </article>
      ))}
    </div>
  );
};
