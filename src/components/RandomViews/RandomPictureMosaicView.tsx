import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSpring, animated } from "@react-spring/web";
import { GalleryImage } from "@/types";
import MosaicImage from "../MosaicImage";

// Helper to calculate masonry columns
function getMasonryColumns(images: GalleryImage[], columnCount: number) {
  const columns: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
  images.forEach((img, idx) => {
    columns[idx % columnCount].push(img);
  });
  return columns;
}

// Sort images by category to ensure they're grouped
function groupImagesByCategory(images: GalleryImage[]): GalleryImage[] {
  const categories: Record<string, GalleryImage[]> = {};

  // Group images by category
  images.forEach((img) => {
    if (!categories[img.cat]) {
      categories[img.cat] = [];
    }
    categories[img.cat].push(img);
  });

  // Flatten the grouped images
  return Object.values(categories).flat();
}

interface RandomPictureMosaicViewProps {
  images: GalleryImage[];
  loadRandomImages: (count: number) => GalleryImage[];
  setImages: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
  columnCount?: number;
}

export const RandomPictureMosaicView: React.FC<RandomPictureMosaicViewProps> = ({ images, loadRandomImages, setImages, columnCount = 3 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerImg, setCenterImg] = useState<number | null>(null);

  // Infinite scroll loading
  // Track scroll position for parallax effects
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Update scroll position for parallax effects
      setScrollY(window.scrollY);

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        setImages((prev) => [...prev, ...loadRandomImages(6)]);
      }
      // Find center image
      if (containerRef.current) {
        const imgs = containerRef.current.querySelectorAll(".mosaic-img");
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        let closestIdx = null;
        let closestDist = Infinity;
        imgs.forEach((el: Element, idx: number) => {
          const rect = el.getBoundingClientRect();
          const imgCenter = rect.top + rect.height / 2 + window.scrollY;
          const dist = Math.abs(imgCenter - viewportCenter);
          if (dist < closestDist && dist < 300) {
            // Only consider it center if truly close
            closestDist = dist;
            closestIdx = idx;
          }
        });
        setCenterImg(closestIdx);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [images, setImages, loadRandomImages]);

  // Responsive columns
  const getResponsiveColumnCount = useCallback(() => {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return columnCount;
  }, [columnCount]);

  const [responsiveColumns, setResponsiveColumns] = useState(getResponsiveColumnCount());

  useEffect(() => {
    const handleResize = () => setResponsiveColumns(getResponsiveColumnCount());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [getResponsiveColumnCount]);

  // Group images by category before arranging in columns
  const sortedImages = useMemo(() => groupImagesByCategory(images), [images]);
  const columns = getMasonryColumns(sortedImages, responsiveColumns);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        alignItems: "flex-start",
        width: "100%",
        boxSizing: "border-box",
        background: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          {col.map((img, idx) => {
            // Calculate global index for center detection
            const globalIdx = colIdx + idx * responsiveColumns;
            const isCenter = globalIdx === centerImg;
            // Calculate whether this is the first image of its category
            const isFirstOfCategory = idx === 0 || col[idx]?.cat !== col[idx - 1]?.cat;

            // Dynamic parallax offset based on scroll position, column, and image position
            const scrollFactor = 0.05 * (colIdx + 1) * 0.15;
            const parallaxY = scrollY * scrollFactor * (1 + idx * 0.02);

            // Add category header if this is the first image of its category
            const categoryHeader = isFirstOfCategory ? (
              <div
                style={{
                  padding: "0.8rem 0",
                  borderBottom: "1px solid #333",
                  marginBottom: "0.8rem",
                  color: "#f0f0f0",
                  fontSize: "1rem",
                  letterSpacing: "0.05rem",
                  fontWeight: "500",
                  transform: `translateY(${scrollY * 0.02}px)`,
                }}
              >
                {img.cat}
              </div>
            ) : null;
            return (
              <MosaicImage
                key={`${img.filename}-${idx}`}
                img={img}
                isCenter={isCenter}
                scrollY={scrollY}
                parallaxY={parallaxY}
                categoryHeader={categoryHeader}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default RandomPictureMosaicView;
