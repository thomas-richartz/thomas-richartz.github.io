import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./IntenseImage.module.css";

interface IIntenseImage {
  nextImage: () => void;
  prevImage: () => void;
  alt: string;
  src: string;
  title: string;
}

export const IntenseImage = ({ nextImage, prevImage, alt, src, title }: IIntenseImage) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hasFullscreenSupport = typeof document !== "undefined" && !!document.fullscreenEnabled;
  // const hasFullscreenSupport = false;

  // Preload the image whenever src changes
  useEffect(() => {
    setIsLoading(true);
    const image = new window.Image();
    image.src = src;
    image.onload = () => {
      setIsLoading(false);
      setCurrentSrc(src);
    };
  }, [src]);

  // Keyboard navigation
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    },
    [isOpen, nextImage, prevImage],
  );

  // Open overlay/fullscreen
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (hasFullscreenSupport && overlayRef.current) {
        overlayRef.current.requestFullscreen?.().catch(() => {});
      }
    }, 10);
  };

  // Close overlay/fullscreen
  const handleClose = () => {
    setIsOpen(false);
    if (hasFullscreenSupport && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Fullscreen exit and scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
      window.addEventListener("keyup", handleKeyUp);
    } else {
      document.body.classList.remove(styles.noScroll);
      window.removeEventListener("keyup", handleKeyUp);
    }
    const fsListener = () => {
      if (!document.fullscreenElement) setIsOpen(false);
    };
    document.addEventListener("fullscreenchange", fsListener);
    return () => {
      document.body.classList.remove(styles.noScroll);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("fullscreenchange", fsListener);
    };
  }, [isOpen, handleKeyUp]);

  if (isLoading) {
    return (
      <div>
        <div className={styles.preloader}></div>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className={styles.intense__lightBoxOverlay} ref={overlayRef} tabIndex={-1} onClick={handleClose} aria-modal="true" role="dialog">
        <div
          className={styles.intense__lightboxImageWrap}
          onClick={(e) => {
            handleClose();
            e.stopPropagation();
          }}
        >
          <img className={styles.intense__lightboxImage} src={currentSrc} alt={alt} draggable={false} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.figureKenBurns}>
        <img onClick={handleOpen} loading="lazy" alt={alt} className={styles.intenseImgKenBurns} src={currentSrc} />
      </div>
      <div className={styles.titleWrap}>
        <span className={styles.title}>{title}</span>
      </div>
    </>
  );
};
