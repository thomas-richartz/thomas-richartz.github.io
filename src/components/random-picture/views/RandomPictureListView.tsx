// import React, { useRef, useEffect } from "react";
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
  const nextImage = () => console.log("RandomPictureListView:nextImage");
  const prevImage = () => console.log("RandomPictureListView:prevImage");

  return (
    <div className={styles.listImagesWrapper}>
      <div className={styles.listContainer}>
        {images.map((image, index) => {
          const factor = (index - Math.floor(images.length / 2)) * 0.2;
          return (
            <div
              key={`${image.title}-${index}`}
              className={styles.imageContainer}
            >
              <IntenseImage
                nextImage={nextImage}
                prevImage={prevImage}
                alt={image.title}
                title={image.title}
                src={`assets/images/${image.filename}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
