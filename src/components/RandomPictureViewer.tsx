import React, { useState, useEffect, useCallback, useRef } from "react";
import { allImages } from "../assets/assets";
import { RandomPicureViewMode } from "../enums";
import { GalleryImage } from "../types";
import { RandomPictureListView } from "./RandomPictureListView";

interface RandomPictureViewerProps {
  mode: RandomPicureViewMode;
}

export const RandomPictureViewer = ({
  mode = RandomPicureViewMode.SCROLL,
}: RandomPictureViewerProps): JSX.Element => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div style={{ marginTop: "101px" }}>
      <RandomPictureListView images={images} selectedImage={undefined} />
      <div ref={loaderRef} style={{ height: "1px" }}></div>
    </div>
  );
};
