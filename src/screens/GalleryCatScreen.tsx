import React, { useEffect, useMemo, useState } from "react";
import { allImages } from "../assets/assets";
import { LazyLoadImage } from "../components/LazyLoadImage";
import { LightBoxImage } from "../components/LightBoxImage";
import styles from "./GalleryCatScreen.module.css";
import { GalleryImage } from "../types";

type GalleryCatScreenProps = {
    cat: string;
    onClick: (cat: string) => void;
};

export const GalleryCatScreen = ({ cat }: GalleryCatScreenProps): JSX.Element => {
    const [hide, setHide] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<GalleryImage | null>(null);

    // Memoized filtered images by category
    const images = useMemo(() => allImages.filter((image) => image.cat === cat), [cat]);

    const showNextImage = () => {
        if (!showImage) return;
        const currentIndex = images.findIndex((image) => image.title === showImage.title);
        const nextIndex = (currentIndex + 1) % images.length;
        setShowImage(images[nextIndex]);
    };

    const showPrevImage = () => {
        if (!showImage) return;
        const currentIndex = images.findIndex((image) => image.title === showImage.title);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setShowImage(images[prevIndex]);
    };

    const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        switch (event.code) {
            case "ArrowLeft":
                showPrevImage();
                break;
            case "ArrowRight":
                showNextImage();
                break;
            case "Escape":
                setShowImage(null);
                break;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setHide(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.imageWrapper} onKeyDown={keyDownHandler} tabIndex={0}>
            {images.map((image, index) => (
                <article
                    key={index}
                    className={styles.image}
                    onClick={() => setShowImage(image)}
                >
                    <h2 className={styles.imageTitle}>{image.title}</h2>
                    <LazyLoadImage
                        alt={image.title}
                        className={styles.imageImg}
                        src={`assets/images/${image.filename}`}
                    />
                </article>
            ))}
            {showImage && (
                <div className={styles.lightBox}>
                    <button className={`${styles.button} ${styles.buttonLeft}`} onClick={showPrevImage}>
                        &#9664;
                    </button>
                    <LightBoxImage
                        alt={showImage.title}
                        src={`assets/images/${showImage.filename}`}
                        className={styles.lightBoxImage}
                        onClick={() => setShowImage(null)}
                    />
                    <button className={`${styles.button} ${styles.buttonRight}`} onClick={showNextImage}>
                        &#9654;
                    </button>
                </div>
            )}
        </div>
    );
};
