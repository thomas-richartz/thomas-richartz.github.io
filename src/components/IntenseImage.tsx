import { useDrag } from "@use-gesture/react";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./IntenseImage.module.css";
import { categoryInterpretations, imageInterpretations } from "@/assets/interpretations";

interface IIntenseImage {
  nextImage: () => void;
  prevImage: () => void;
  alt: string;
  src: string;
  title: string;
  category?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export const IntenseImage = ({ nextImage, prevImage, alt, src, title, category = "", onClose, isOpen = false }: IIntenseImage) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const categoryInterpretation = categoryInterpretations[category];
  const imageKey = src.replace(/^.*assets\/images\//, "");
  const imageInterpretation = imageInterpretations[imageKey];
  const hasInterpretation = !!(categoryInterpretation || imageInterpretation);

  const [showInterpretation, setShowInterpretation] = useState(hasInterpretation);

  useEffect(() => {
    setShowInterpretation(hasInterpretation);
  }, [hasInterpretation, src, title]);

  const bind = useDrag(
    ({ last, movement: [mx], velocity: [vx] }) => {
      if (last && Math.abs(vx) > 0.2) {
        if (mx < 0) nextImage();
        else if (mx > 0) prevImage();
      }
    },
    { axis: "x", enabled: isOpen },
  );

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

  const hasFullscreenSupport = typeof document !== "undefined" && !!document.fullscreenEnabled;

  useEffect(() => {
    const fsListener = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && isFullscreen && onClose) onClose();
    };
    document.addEventListener("fullscreenchange", fsListener);
    return () => {
      document.removeEventListener("fullscreenchange", fsListener);
    };
  }, [isFullscreen, onClose]);

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
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    }
  };

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
        {...bind()}
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
          {/* Flex row for action icons */}
          <div className={styles.iconRow}>
            {/* INTERPRETATION ICON & POPOVER */}
            {hasInterpretation && (
              <div className={styles.interpretationIconWrap}>
                <button
                  className={styles.interpretationButton}
                  aria-label="Show interpretation"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInterpretation((v) => !v);
                  }}
                  style={{
                    display: isFullscreen ? "none" : "inline-flex",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <circle cx="12" cy="8" r="1" />
                  </svg>
                </button>
                {showInterpretation && (
                  <div
                    className={styles.interpretationPopover}
                    style={{
                      display: isFullscreen ? "none" : "flex",
                    }}
                  >
                    {categoryInterpretation && (
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: 4 }}>{category}</div>
                        <div style={{ marginBottom: imageInterpretation ? 12 : 0 }}>{categoryInterpretation}</div>
                      </div>
                    )}
                    {imageInterpretation && (
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: 4 }}>{title}</div>
                        <div>{imageInterpretation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* FULLSCREEN BUTTON */}
            {hasFullscreenSupport && (
              <button
                className={styles.fullscreenButton}
                onClick={handleRequestFullscreen}
                aria-label="Show fullscreen"
                type="button"
                style={{ display: isFullscreen ? "none" : "inline-flex" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{ width: 24, height: 24 }}
                >
                  <path d="M4 9V5 Q4 4 5 4 H9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 4h4 Q20 4 20 5 v4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 15v4 Q20 20 19 20 h-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 20H5 Q4 20 4 19 v-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button className={styles.closeButton} onClick={handleClose} aria-label="Close" type="button" style={{ display: isFullscreen ? "none" : "block" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          className={styles.prevButton}
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          aria-label="Previous"
          type="button"
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
          type="button"
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
