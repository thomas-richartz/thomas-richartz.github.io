import React, { useState } from "react";
import { GalleryImage } from "../types";
import { IntenseImage } from "./IntenseImage";
import { LightBoxImage } from "./LightBoxImage";
import styles from "./RandomPictureListView.module.css";
import lightBoxStyles from "./LightBoxImage.module.css";

interface IRandomPictureListView {
  images: GalleryImage[];
  selectedImage?: GalleryImage;
}

export const RandomPictureListView = ({
  images,
  selectedImage,
}: IRandomPictureListView): JSX.Element => {
  const nextImage = () => {
    console.log("RandomPictureListView:nextImage");
  };

  const prevImage = () => {
    console.log("RandomPictureListView:prevImage");
  };

  return (
    <div className={styles.listContainer}>
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
