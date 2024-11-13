import React from "react";
import throttle from "lodash.throttle";
import { useIntersectionObserver } from "usehooks-ts";
import styles from "./IntenseImage.module.css";
import { LightBoxImage } from "./LightBoxImage";

interface IIntenseImage {
    nextImage: () => void;
    prevImage: () => void;
    alt: string;
    src: string;
    title: string;
    className?: string;
}

export const IntenseImage = ({
                                 nextImage,
                                 prevImage,
                                 alt,
                                 src,
                                 title
                             }: IIntenseImage) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [currentSrc, setCurrentSrc] = React.useState<string>("");
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const ref = React.useRef<HTMLDivElement | HTMLImageElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting;
    const hasFullscreenSupport = document.fullscreenEnabled;

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Escape") document.exitFullscreen();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    };

    const throttledKeyUp = React.useMemo(() => throttle(handleKeyUp, 300), []);

    const makeFullScreen = (element: any) => {
        element.requestFullscreen();
    };

    const handleClick = (e: Event | React.MouseEvent<HTMLImageElement>) => {
        isOpen ? hideViewer() : showViewer(e);
    };

    const showViewer = (e: Event | React.MouseEvent<HTMLImageElement>) => {
        if (e.currentTarget && hasFullscreenSupport) {
            makeFullScreen(e.currentTarget);
        }
        setIsOpen(true);
    };

    const hideViewer = () => {
        if (hasFullscreenSupport) document.exitFullscreen();
        setIsOpen(false);
    };

    React.useEffect(() => {
        window.addEventListener("keyup", throttledKeyUp);
        return () => {
            window.removeEventListener("keyup", throttledKeyUp);
        };
    }, [isLoading]);

    React.useEffect(() => {
        if (isVisible) {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                setIsLoading(false);
                setCurrentSrc(src);
            };
        }
    }, [src, isVisible]);

    if (isLoading) {
        return (
            <div ref={ref}>
                <div className={styles.preloader}></div>
            </div>
        );
    }

    if (isOpen && !hasFullscreenSupport) {
        return (
            <div className={styles.lightBox}>
                <LightBoxImage
                    onClick={handleClick}
                    alt={title}
                    src={currentSrc}
                    className={styles.intenseImg}
                />
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            onClick={handleClick}
            loading="lazy"
            alt={alt}
            className={styles.intenseImg}
            src={currentSrc}
        />
    );
};
