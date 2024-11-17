import React, { useState } from "react";
import { GalleryImage } from "../types";
import { IntenseImage } from "./IntenseImage";
import { LightBoxImage } from "./LightBoxImage";
import styles from "./RandomPictureListView.module.css";
import lightBoxStyles from "./LightBoxImage.module.css"

interface IRandomPictureListView {
  images: GalleryImage[];
  selectedImage?: GalleryImage;
}

export const RandomPictureListView = ({
  images,
  selectedImage,
}: IRandomPictureListView): JSX.Element => {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const handleImageClick = (image: GalleryImage) => {
    setLightboxImage(image);
  };

  const nextImage = () => {
    // Implement logic for showing the next image in the lightbox
  };

  const prevImage = () => {
    // Implement logic for showing the previous image in the lightbox
  };

  return (
    <div className={styles.imageGrid}>
      {images.map((image, index) => (
        <div
          key={`${image.title}-${index}`}
          className={styles.imageContainer}
          onClick={() => handleImageClick(image)} // Open lightbox on image click
        >
          <IntenseImage
            nextImage={nextImage}
            prevImage={prevImage}
            alt={image.title}
            title={image.title}
            className={styles.randomImg}
            src={`assets/images/${image.filename}`}
          />          
        </div>
      ))}
      {lightboxImage && (
        <LightBoxImage
          onClick={() => setLightboxImage(null)} // Close lightbox on click
          alt={lightboxImage.title}
          src={`assets/images/${lightboxImage.filename}`}
          className={lightBoxStyles.lightBoxImage}
        />
      )}
    </div>
  );
};
