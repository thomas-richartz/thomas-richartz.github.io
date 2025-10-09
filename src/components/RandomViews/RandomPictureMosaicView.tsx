import { useEffect, useRef, useState, useMemo } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import type { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureMosaicView.module.css";

// Grid Configuration
const GRID = {
  SIZE: 6,
  TYPES: {
    SQUARE: { cols: 1, rows: 1 },
    WIDE: { cols: 2, rows: 1 },
    ULTRAWIDE: { cols: 6, rows: 1 },
    HIGH: { cols: 1, rows: 2 },
    ULTRAHIGH: { cols: 1, rows: 6 },
  },
  RATIOS: {
    ULTRAWIDE: 5.0, // > 5:1 (full width)
    WIDE: 1.5, // > 1.5:1
    ULTRAHIGH: 0.2, // < 0.2:1 (full height)
    HIGH: 0.67, // < 0.67:1
  },
  BATCH_SIZE: 36, // Full 6x6 grid
} as const;

// Types
interface GridPlacement {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

interface MosaicGroup {
  images: GalleryImage[];
  startIndex: number;
}

// Helper Functions
const calculateImageSpans = (width: number, height: number): { colSpan: number; rowSpan: number } => {
  const ratio = width / height;

  if (ratio > GRID.RATIOS.ULTRAWIDE) return GRID.TYPES.ULTRAWIDE;
  if (ratio > GRID.RATIOS.WIDE) return GRID.TYPES.WIDE;
  if (ratio < GRID.RATIOS.ULTRAHIGH) return GRID.TYPES.ULTRAHIGH;
  if (ratio < GRID.RATIOS.HIGH) return GRID.TYPES.HIGH;
  return GRID.TYPES.SQUARE;
};

const findAvailablePosition = (grid: boolean[][], colSpan: number, rowSpan: number): GridPlacement | null => {
  for (let row = 0; row <= GRID.SIZE - rowSpan; row++) {
    for (let col = 0; col <= GRID.SIZE - colSpan; col++) {
      let canPlace = true;

      // Check if space is available
      for (let r = row; r < row + rowSpan && canPlace; r++) {
        for (let c = col; c < col + colSpan && canPlace; c++) {
          if (grid[r][c]) canPlace = false;
        }
      }

      if (canPlace) {
        // Mark space as occupied
        for (let r = row; r < row + rowSpan; r++) {
          for (let c = col; c < col + colSpan; c++) {
            grid[r][c] = true;
          }
        }
        return { colStart: col, rowStart: row, colSpan, rowSpan };
      }
    }
  }
  return null;
};

const calculatePlacements = (images: GalleryImage[]): GridPlacement[] => {
  const grid = Array(GRID.SIZE)
    .fill(null)
    .map(() => Array(GRID.SIZE).fill(false));

  const placements: GridPlacement[] = Array(images.length);

  // Sort images by size (larger first)
  const sortedImagesWithIndices = images
    .map((img, index) => ({ img, index }))
    .sort((a, b) => {
      const aSize = (a.img.width || 1) * (a.img.height || 1);
      const bSize = (b.img.width || 1) * (b.img.height || 1);
      return bSize - aSize;
    });

  // Place images in sorted order
  sortedImagesWithIndices.forEach(({ img, index }) => {
    if (!img.width || !img.height) {
      placements[index] = {
        colStart: index % GRID.SIZE,
        rowStart: Math.floor(index / GRID.SIZE),
        colSpan: 1,
        rowSpan: 1,
      };
      return;
    }

    const { colSpan, rowSpan } = calculateImageSpans(img.width, img.height);
    const placement = findAvailablePosition(grid, colSpan, rowSpan);

    placements[index] = placement || {
      colStart: index % GRID.SIZE,
      rowStart: Math.floor(index / GRID.SIZE),
      colSpan: 1,
      rowSpan: 1,
    };
  });

  return placements;
};

const MosaicImage = ({
  image,
  placement,
  onClick,
  onLoad,
}: {
  image: GalleryImage;
  placement: GridPlacement;
  onClick: () => void;
  onLoad: (image: GalleryImage, width: number, height: number) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const overlaySpring = useSpring({
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? "translateY(0)" : "translateY(100%)",
    config: { tension: 280, friction: 60 },
  });

  return (
    <div
      className={styles.imageWrapper}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        gridColumn: `${placement.colStart + 1} / span ${placement.colSpan}`,
        gridRow: `${placement.rowStart + 1} / span ${placement.rowSpan}`,
      }}
    >
      <div className={`${styles.imageContainer} ${isLoaded ? styles.loaded : ""}`}>
        <img
          ref={imageRef}
          src={`/assets/images/${image.filename}`}
          alt={image.title}
          loading="lazy"
          className={styles.mosaicImage}
          onLoad={() => {
            if (imageRef.current) {
              const { naturalWidth, naturalHeight } = imageRef.current;
              setIsLoaded(true);
              onLoad(image, naturalWidth, naturalHeight);
            }
          }}
        />
        <animated.div className={styles.overlay} style={overlaySpring}>
          <h3>{image.title}</h3>
          <span>{image.cat}</span>
        </animated.div>
      </div>
    </div>
  );
};

const MosaicGroup = ({ group, onImageClick }: { group: MosaicGroup; onImageClick: (index: number) => void }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, { width: number; height: number }>>({});
  const [placements, setPlacements] = useState<GridPlacement[]>(
    group.images.map((_, idx) => ({
      colStart: idx % GRID.SIZE,
      rowStart: Math.floor(idx / GRID.SIZE),
      colSpan: 1,
      rowSpan: 1,
    })),
  );

  // Recalculate placements whenever loadedImages or group.images changes
  useEffect(() => {
    const imagesWithDimensions = group.images.map((img) => ({
      ...img,
      width: loadedImages[img.filename]?.width,
      height: loadedImages[img.filename]?.height,
    }));

    // For images with dimensions, calculate spans; fallback to 1x1 for others
    const newPlacements = calculatePlacements(imagesWithDimensions);
    setPlacements(
      group.images.map(
        (_, idx) =>
          newPlacements[idx] || {
            colStart: idx % GRID.SIZE,
            rowStart: Math.floor(idx / GRID.SIZE),
            colSpan: 1,
            rowSpan: 1,
          },
      ),
    );
  }, [loadedImages, group.images]);

  const handleImageLoad = (image: GalleryImage, width: number, height: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [image.filename]: { width, height },
    }));
  };

  return (
    <div className={styles.mosaicGroup}>
      {group.images.map((img, idx) => {
        const placement = placements[idx];
        if (!placement) return null; // Defensive: skip rendering if placement is not ready
        return (
          <MosaicImage key={img.filename} image={img} placement={placement} onClick={() => onImageClick(group.startIndex + idx)} onLoad={handleImageLoad} />
        );
      })}
    </div>
  );
};

export function RandomPictureMosaicView({
  images,
  loadRandomImages,
  setImages,
}: {
  images: GalleryImage[];
  loadRandomImages: (count: number) => GalleryImage[];
  setImages: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [showIndex, setShowIndex] = useState<number | null>(null);

  const mosaicGroups = useMemo(
    () =>
      Array.from({ length: Math.ceil(images.length / GRID.BATCH_SIZE) }, (_, i) => ({
        images: images.slice(i * GRID.BATCH_SIZE, (i + 1) * GRID.BATCH_SIZE),
        startIndex: i * GRID.BATCH_SIZE,
      })),
    [images],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setImages((prev) => [...prev, ...loadRandomImages(GRID.BATCH_SIZE)]);
        }
      },
      { rootMargin: "200px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadRandomImages, setImages]);

  const bindGesture = useGesture({
    onDrag: ({ direction: [dx] }) => {
      if (showIndex === null) return;
      if (dx > 0) {
        setShowIndex((prev) => (prev === null || prev <= 0 ? images.length - 1 : prev - 1));
      }
      if (dx < 0) {
        setShowIndex((prev) => (prev === null || prev >= images.length - 1 ? 0 : prev + 1));
      }
    },
  });

  return (
    <div ref={containerRef} className={styles.mosaicContainer}>
      {mosaicGroups.map((group) => (
        <MosaicGroup key={`group-${group.startIndex}`} group={group} onImageClick={setShowIndex} />
      ))}

      <div ref={loaderRef} className={styles.loader} />

      {showIndex !== null && (
        <div {...bindGesture()} tabIndex={-1}>
          <IntenseImage
            alt={images[showIndex].title}
            title={images[showIndex].title}
            category={images[showIndex].cat}
            src={`assets/images/${images[showIndex].filename}`}
            nextImage={() => setShowIndex((prev) => (prev === null || prev >= images.length - 1 ? 0 : prev + 1))}
            prevImage={() => setShowIndex((prev) => (prev === null || prev <= 0 ? images.length - 1 : prev - 1))}
            onClose={() => setShowIndex(null)}
            isOpen
          />
        </div>
      )}
    </div>
  );
}
