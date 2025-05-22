import React from "react";
import { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureListView.module.css";

interface ViewProps {
  images: GalleryImage[];
  selectedImage?: GalleryImage;
}

export const RandomPictureGridView = ({ images }: ViewProps) => {
  const nextImage = () => {};
  const prevImage = () => {};

  return (
    <div className={styles.gridContainer}>
      {images.map((image, index) => (
        <div key={index} className={styles.gridItem}>
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
