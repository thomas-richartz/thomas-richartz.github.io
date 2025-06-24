import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./IntenseImage.module.css";

interface IIntenseImage {
  nextImage: () => void;
  prevImage: () => void;
  alt: string;
  src: string;
  title: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export const IntenseImage = ({ nextImage, prevImage, alt, src, title, onClose, isOpen = false }: IIntenseImage) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hasFullscreenSupport = typeof document !== "undefined" && !!document.fullscreenEnabled;

  // Preload image
  useEffect(() => {
    setIsLoading(true);
    const image = new window.Image();
    image.src = src;
    image.onload = () => setIsLoading(false);
  }, [src]);

  // Keyboard navigation
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    },
    [isOpen, nextImage, prevImage, onClose],
  );

  // Listen for fullscreen changes to update state
  useEffect(() => {
    const fsListener = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // If exited fullscreen via ESC, also close overlay
      if (!document.fullscreenElement && isFullscreen && onClose) onClose();
    };
    document.addEventListener("fullscreenchange", fsListener);
    return () => {
      document.removeEventListener("fullscreenchange", fsListener);
    };
  }, [isFullscreen, onClose]);

  // Scroll lock and handle keyboard
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
      window.addEventListener("keyup", handleKeyUp);
    } else {
      document.body.classList.remove(styles.noScroll);
      window.removeEventListener("keyup", handleKeyUp);
    }
    return () => {
      document.body.classList.remove(styles.noScroll);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, handleKeyUp]);

  const handleRequestFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasFullscreenSupport && overlayRef.current && !document.fullscreenElement) {
      overlayRef.current
        .requestFullscreen?.()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch(() => {});
    }
  };

  // Close & exit fullscreen if needed
  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasFullscreenSupport && document.fullscreenElement) {
      document
        .exitFullscreen?.()
        .then(() => {
          setIsFullscreen(false);
          onClose?.();
        })
        .catch(() => {
          onClose?.();
        });
    } else {
      onClose?.();
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className={styles.preloader}></div>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div
        className={`${styles.intense__lightBoxOverlay} ${isOpen ? styles.intense__lightBoxOverlayOpen : ""}`}
        ref={overlayRef}
        tabIndex={-1}
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.intense__lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
          <img
            className={styles.intense__lightboxImage}
            src={src}
            alt={alt}
            draggable={false}
            onClick={(e) => {
              hasFullscreenSupport && handleClose();
              e.stopPropagation();
            }}
          />
          {/* <div className={styles.titleOverlay}>{title}</div> */}
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(0,0,0,0.5)",
              color: "rgba(169,169,169,0.5)",
              border: "none",
              borderRadius: 20,
              width: 40,
              height: 40,
              fontSize: 24,
              cursor: "pointer",
              zIndex: 2,
              verticalAlign: "middle",
              display: isFullscreen ? "none" : "inline-flex",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          {hasFullscreenSupport && (
            <button
              className={styles.fullscreenButton}
              onClick={handleRequestFullscreen}
              aria-label="Show fullscreen"
              style={{
                position: "absolute",
                top: 20,
                right: 70,
                background: "rgba(0,0,0,0.5)",
                color: "rgba(169,169,169,0.5)",
                border: "none",
                borderRadius: 20,
                width: 40,
                height: 40,
                fontSize: 24,
                cursor: "pointer",
                zIndex: 2,
                display: isFullscreen ? "none" : "inline-block",
                alignItems: "center",
                verticalAlign: "middle",
                justifyContent: "center",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 24, height: 24 }}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          className={styles.prevButton}
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          aria-label="Previous"
          style={{ position: "absolute", left: 10, top: "50%" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#FF9999" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          className={styles.nextButton}
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          aria-label="Next"
          style={{ position: "absolute", right: 10, top: "50%" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#FF9999" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    );
  }

  // Grid mode: no title shown on image
  return (
    <>
      <div className={styles.figureKenBurns}>
        <img loading="lazy" alt={alt} className={styles.intenseImgKenBurns} src={src} />
      </div>
      <div className={styles.titleWrap}>
        <span className={styles.title}>{title}</span>
      </div>
    </>
  );
};
