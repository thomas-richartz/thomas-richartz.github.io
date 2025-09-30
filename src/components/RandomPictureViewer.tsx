import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTransition } from "@react-spring/web";
import { allImages } from "@/assets/assets";
import { RandomPictureViewMode } from "@/enums";
import { RandomPictureMosaicView } from "@/components/RandomViews/RandomPictureMosaicView";
import { GalleryImage } from "@/types";
import { RandomPictureListView } from "@/components/RandomViews/RandomPictureListView";
import { RandomPictureGridView } from "@/components/RandomViews/RandomPictureGridView";
import { RandomPictureParallaxView } from "@/components/RandomViews/RandomPictureParallaxView";
import { RandomPictureDreiView } from "@/components/RandomViews/RandomPictureDreiView";

interface RandomPictureViewerProps {}

export const RandomPictureViewer = ({}: RandomPictureViewerProps): JSX.Element => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState(RandomPictureViewMode.SCROLL);
  const [iconMode, setIconMode] = useState(viewMode);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Add SCROLL_MOSAIC to cycling logic
  const nextViewMode = () => {
    let next;
    switch (viewMode) {
      case RandomPictureViewMode.SCROLL:
        next = RandomPictureViewMode.SCROLL_GRID;
        break;
      case RandomPictureViewMode.SCROLL_GRID:
        next = RandomPictureViewMode.SCROLL_DREI;
        // next = RandomPictureViewMode.SCROLL_PARALLAX;
        break;
      case RandomPictureViewMode.SCROLL_PARALLAX:
        next = RandomPictureViewMode.SCROLL_DREI;
        break;
      case RandomPictureViewMode.SCROLL_DREI:
        next = RandomPictureViewMode.SCROLL_MOSAIC;
        break;
      case RandomPictureViewMode.SCROLL_MOSAIC:
      default:
        next = RandomPictureViewMode.SCROLL;
        break;
    }
    // switch (viewMode) {
    //   case RandomPictureViewMode.SCROLL:
    //     next = RandomPictureViewMode.SCROLL_GRID;
    //     break;
    //   case RandomPictureViewMode.SCROLL_GRID:
    //     // next = RandomPictureViewMode.SCROLL_PARALLAX;
    //     next = RandomPictureViewMode.SCROLL_DREI;
    //     break;
    //   case RandomPictureViewMode.SCROLL_PARALLAX:
    //     next = RandomPictureViewMode.SCROLL_DREI;
    //     break;
    //   case RandomPictureViewMode.SCROLL_DREI:
    //   //   next = RandomPictureViewMode.SCROLL_MOSAIC;
    //   //   break;
    //   // case RandomPictureViewMode.SCROLL_MOSAIC:
    //   default:
    //     next = RandomPictureViewMode.SCROLL;
    //     break;
    // }
    setViewMode(next);
    setIconMode(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadRandomImages = useCallback((count: number) => {
    const newImages: GalleryImage[] = [];
    const availableImages = allImages.slice();

    for (let i = 0; i < count && availableImages.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      const [selectedImage] = availableImages.splice(randomIndex, 1);
      newImages.push(selectedImage);
    }

    return newImages;
  }, []);

  useEffect(() => {
    setImages(loadRandomImages(10));
  }, [loadRandomImages]);

  useEffect(() => {
    if (viewMode === RandomPictureViewMode.SCROLL || viewMode === RandomPictureViewMode.SCROLL_GRID) {
      const observer = new IntersectionObserver((entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && hasMore) {
          setImages((prevImages) => [...prevImages, ...loadRandomImages(5)]);
        }
      });

      if (loaderRef.current) {
        observer.observe(loaderRef.current);
      }

      return () => {
        if (loaderRef.current) observer.unobserve(loaderRef.current);
      };
    }
  }, [loadRandomImages, hasMore, viewMode]);

  // Auto-advance every 10 seconds
  // useEffect(() => {
  //   if (viewMode === RandomPictureViewMode.SCROLL_PARALLAX) {
  //     const interval = setInterval(() => {
  //       setImages((prevImages) => {
  //         const next = [...prevImages];
  //         next.push(...loadRandomImages(1));
  //         return next.slice(1);
  //       });
  //     }, 10000);
  //     return () => clearInterval(interval);
  //   }
  // }, [viewMode, loadRandomImages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderView = () => {
    switch (viewMode) {
      case RandomPictureViewMode.SCROLL_GRID:
        return (
          <>
            <RandomPictureGridView images={images} />
            <div ref={loaderRef} style={{ height: "1px" }}></div>
          </>
        );
      case RandomPictureViewMode.SCROLL_PARALLAX:
        return (
          <div style={{ height: "100vh", overflow: "hidden" }}>
            <RandomPictureParallaxView loadRandomImages={loadRandomImages} images={images} setImages={setImages} />
          </div>
        );
      case RandomPictureViewMode.SCROLL_DREI:
        return (
          <div style={{ height: "100vh", overflow: "hidden" }}>
            <RandomPictureDreiView loadRandomImages={loadRandomImages} images={images} setImages={setImages} />
          </div>
        );
      case RandomPictureViewMode.SCROLL_MOSAIC:
        return (
          <div style={{ minHeight: "100vh", background: "#f8f8fa" }}>
            <RandomPictureMosaicView loadRandomImages={loadRandomImages} images={images} setImages={setImages} />
          </div>
        );
      case RandomPictureViewMode.SCROLL:
      default:
        return (
          <>
            <RandomPictureListView images={images} />
            <div ref={loaderRef} style={{ height: "1px" }}></div>
          </>
        );
    }
  };

  const getIconPath = (mode: RandomPictureViewMode) => {
    switch (mode) {
      case RandomPictureViewMode.SCROLL_GRID:
        return (
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="#FF9999" strokeWidth="1" fill="none">
            <rect x="8" y="8" width="16" height="16" />
            <rect x="28" y="8" width="16" height="16" />
            <rect x="8" y="28" width="16" height="16" />
            <rect x="28" y="28" width="16" height="16" />
          </svg>
        );
      case RandomPictureViewMode.SCROLL_PARALLAX:
        // // icon for SCROLL_PARALLAX
        return (
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="#FF9999" strokeWidth="2" fill="none">
            <circle cx="32" cy="32" r="20" />
            <path d="M16,32 Q32,8 48,32" />
            <path d="M16,40 Q32,16 48,40" />
          </svg>
        );
      case RandomPictureViewMode.SCROLL_DREI:
        return (
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="#664455" strokeWidth="1" fill="none">
            <path d="M16,48 L48,16" />
            <path d="M16,40 L40,16" />
            <path d="M24,48 L48,24" />
          </svg>
        );
      case RandomPictureViewMode.SCROLL_MOSAIC:
        // Fancy outline SVG icon for mosaic mode
        return (
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="#FFB347" strokeWidth="2" fill="none">
            <rect x="6" y="6" width="18" height="18" rx="4" />
            <rect x="26" y="10" width="32" height="12" rx="6" />
            <rect x="10" y="28" width="20" height="30" rx="6" />
            <rect x="34" y="28" width="20" height="20" rx="6" />
            <rect x="34" y="50" width="20" height="8" rx="4" />
            <circle cx="16" cy="16" r="3" stroke="#FFB347" fill="#fff" />
            <circle cx="44" cy="34" r="3" stroke="#FFB347" fill="#fff" />
          </svg>
        );
      case RandomPictureViewMode.SCROLL:
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke="#EEEEEE" strokeWidth="1" fill="none">
            <rect x="12" y="12" width="40" height="40" />
            <line x1="32" y1="12" x2="32" y2="52" />
          </svg>
        );
    }
  };

  return (
    <div style={{ marginTop: "101px" }}>
      {renderView()}
      <button
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          width: 48,
          height: 48,
          borderRadius: "12px",
          background: "none",
          color: "#ff9",
          fontSize: "1.5rem",
          zIndex: 100,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={nextViewMode}
      >
        {getIconPath(viewMode)}
      </button>
    </div>
  );
};
