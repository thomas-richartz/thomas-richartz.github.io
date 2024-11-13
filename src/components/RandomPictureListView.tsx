import React, { useMemo } from "react";
import { allImages } from "../assets/assets";
import { GalleryImage } from "../types";
import { IntenseImage } from "./IntenseImage";
import { LightBoxImage } from "./LightBoxImage";
import styles from "./RandomPictureListView.module.css";

interface IRandomPictureListView {
    images: GalleryImage[];
    selectedImage: GalleryImage | undefined;
}

export const RandomPictureListView = ({ images, selectedImage }: IRandomPictureListView): JSX.Element => {

    // Prepare `imagesByRange` and `sortedImagesByCatAndRange` with `useMemo` to avoid recalculations
    const imagesByRange = useMemo(() => {
        const rangeImages: { [key: string]: GalleryImage[] } = {};
        allImages.forEach((image) => {
            const rangeKey = `${image.range[0]}-${image.range[1]}`;
            if (!rangeImages[rangeKey]) rangeImages[rangeKey] = [];
            rangeImages[rangeKey].push(image);
        });
        return rangeImages;
    }, []);

    const sortedImagesByCatAndRange = useMemo(() =>
            allImages.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1)),
        []
    );

    // Event handlers for navigating images
    const nextImage = () => console.log("nextImage");
    const prevImage = () => console.log("prevImage");

    // Display a lightbox view if a selected image is provided
    if (selectedImage) {
        return (
            <LightBoxImage
                onClick={() => {}}
                alt={selectedImage.title}
                className={styles.randomImg}
                src={`assets/images/${selectedImage.filename}`}
            />
        );
    }

    // Generate list of images with unique keys
    const randomImages = images.map((image, index) => (
        <div key={image.title + "-" + index} className={styles.imageContainer}>
            <IntenseImage
                nextImage={nextImage}
                prevImage={prevImage}
                alt={image.title}
                title={image.title}
                className={styles.randomImg}
                src={`assets/images/${image.filename}`}
            />
        </div>
    ));

    return <>{randomImages}</>;
};
