import React, { useRef, useEffect } from "react";
import { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureListView.module.css";

interface IRandomPictureListView {
  images: GalleryImage[];
  selectedImage?: GalleryImage;
}

export const RandomPictureListView = ({
  images,
  selectedImage,
}: IRandomPictureListView): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const imageContainers = containerRef.current?.querySelectorAll(
        `.${styles.imageContainer}`,
      );

      imageContainers?.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = rect.top + window.scrollY;
        const distanceFromCenter = Math.abs(
          scrollTop + window.innerHeight / 2 - offset,
        );
        const scale = Math.max(0.9, 1.3 - distanceFromCenter / 1500);
        const rotateX = Math.min(45, distanceFromCenter / 10);

        (el as HTMLElement).style.transform =
          `scale(${scale}) rotateX(${rotateX}deg)`;
        (el as HTMLElement).style.opacity =
          `${Math.max(0.5, 1 - distanceFromCenter / 1000)}`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextImage = () => {
    console.log("RandomPictureListView:nextImage");
  };

  const prevImage = () => {
    console.log("RandomPictureListView:prevImage");
  };

  return (
    <div ref={containerRef} className={styles.listContainer}>
      {images.map((image, index) => (
        <div key={`${image.title}-${index}`} className={styles.imageContainer}>
          <IntenseImage
            nextImage={nextImage}
            prevImage={prevImage}
            alt={image.title}
            title={image.title}
            src={`assets/images/${image.filename}`}
          />
        </div>
      ))}
    </div>
  );
};
