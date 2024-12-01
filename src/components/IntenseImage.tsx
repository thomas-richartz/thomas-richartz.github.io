import { useState, useEffect, useRef, useCallback } from "react";
// import throttle from "lodash.throttle";
import { useIntersectionObserver } from "usehooks-ts";
import styles from "./IntenseImage.module.css";
import { LightBoxImage } from "./LightBoxImage";
// import { ExitFullScreenIcon } from "@radix-ui/react-icons";

interface IIntenseImage {
  nextImage: () => void;
  prevImage: () => void;
  alt: string;
  src: string;
  title: string;
  // className?: string;
}

export const IntenseImage = ({
  nextImage,
  prevImage,
  alt,
  src,
  title,
}: IIntenseImage) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const options = { threshold: 0.5 };
  const entry = useIntersectionObserver(ref, options);
  const isVisible = !!entry?.isIntersecting;
  const hasFullscreenSupport = document.fullscreenEnabled;

  // Preload the image
  useEffect(() => {
    if (isVisible) {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        setIsLoading(false);
        setCurrentSrc(src);
      };
    }
  }, [src, isVisible]);

  // Handle keyboard navigation
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") hideFullscreen();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    },
    [nextImage, prevImage]
  );

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  // Open fullscreen
  const showFullscreen = () => {
    if (hasFullscreenSupport && fullscreenContainerRef.current) {
      fullscreenContainerRef.current.style.display = "flex";
      fullscreenContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen failed:", err);
      });
      setIsOpen(true);
    } else {
      // Fallback: for devices without fullscreen support
      setIsOpen(true);
    }
  };

  // Close fullscreen
  const hideFullscreen = () => {
    if (hasFullscreenSupport && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Exiting fullscreen failed:", err);
      });
    }
    setIsOpen(false);
    if (fullscreenContainerRef.current) {
      fullscreenContainerRef.current.style.display = "none";
    }
  };

  // Handle fullscreen exit cleanup
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsOpen(false);
        if (fullscreenContainerRef.current) {
          fullscreenContainerRef.current.style.display = "none";
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div ref={ref}>
        <div className={styles.preloader}></div>
      </div>
    );
  }

  // Mobile Fallback
  if (isOpen && !hasFullscreenSupport) {
    return (
      <div className={styles.lightBox}>
        <LightBoxImage
          onClick={hideFullscreen}
          alt={title}
          src={currentSrc}
          className={styles.intenseImg}
        />
      </div>
    );
  }

  return (
    <>
      {/* Main Image */}
      <div className={styles.figureKenBurns}>
        <img
          ref={imgRef}
          onClick={showFullscreen}
          loading="lazy"
          alt={alt}
          className={styles.intenseImgKenBurns}
          src={currentSrc}
        />
        <span className={styles.title}>{title}</span>
      </div>

      {/* Fullscreen Overlay */}
      {hasFullscreenSupport && (
        <div
          ref={fullscreenContainerRef}
          className={styles.fullscreenContainer}
          style={{ display: "none" }} // Hidden by default
        >
          <img
            alt={alt}
            className={styles.fullscreenImg}
            src={currentSrc}
            onClick={hideFullscreen} // Exit fullscreen on click
          />
        </div>
      )}
    </>
  );
};
