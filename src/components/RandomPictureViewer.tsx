import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTransition } from "@react-spring/web";
import { allImages } from "../assets/assets";
import { RandomPicureViewMode } from "../enums";
import { GalleryImage } from "../types";
import { RandomPictureListView } from "./RandomPictureListView";
import { RandomPictureGridView } from "./RandomPictureGridView";
import { RandomPictureParallaxView } from "./RandomPictureParallaxView";

interface RandomPictureViewerProps {}

export const RandomPictureViewer =
  ({}: RandomPictureViewerProps): JSX.Element => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState(RandomPicureViewMode.SCROLL);
    const [iconMode, setIconMode] = useState(viewMode);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const nextViewMode = () => {
      setViewMode((prev) =>
        prev === RandomPicureViewMode.SCROLL_PARALLAX
          ? RandomPicureViewMode.SCROLL
          : ((prev + 1) as RandomPicureViewMode),
      );
      setIconMode(viewMode);
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
    }, [loadRandomImages, hasMore]);

    const renderView = () => {
      switch (viewMode) {
        case RandomPicureViewMode.SCROLL_GRID:
          return <RandomPictureGridView images={images} />;
        case RandomPicureViewMode.SCROLL_PARALLAX:
          return <RandomPictureParallaxView images={images} />;
        case RandomPicureViewMode.SCROLL:
        default:
          return (
            <RandomPictureListView images={images} selectedImage={undefined} />
          );
      }
    };

    const getIconPath = (mode: RandomPicureViewMode) => {
      switch (mode) {
        case RandomPicureViewMode.SCROLL_GRID:
          return (
            <svg
              width="32"
              height="32"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#FF9999"
              strokeWidth="4"
              fill="none"
            >
              <rect x="8" y="8" width="16" height="16" />
              <rect x="28" y="8" width="16" height="16" />
              <rect x="8" y="28" width="16" height="16" />
              <rect x="28" y="28" width="16" height="16" />
            </svg>
          );
        case RandomPicureViewMode.SCROLL_PARALLAX:
          return (
            <svg
              width="32"
              height="32"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#664455"
              strokeWidth="4"
              fill="none"
            >
              <path d="M16,48 L48,16" />
              <path d="M16,40 L40,16" />
              <path d="M24,48 L48,24" />
            </svg>
          );
        case RandomPicureViewMode.SCROLL:
        default:
          return (
            <svg
              width="32"
              height="32"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#EEEEEE"
              strokeWidth="4"
              fill="none"
            >
              <rect x="12" y="12" width="40" height="40" />
              <line x1="32" y1="12" x2="32" y2="52" />
            </svg>
          );
      }
    };

    return (
      <div style={{ marginTop: "101px" }}>
        {renderView()}
        <div ref={loaderRef} style={{ height: "1px" }}></div>
        <button
          style={{
            position: "absolute",
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
