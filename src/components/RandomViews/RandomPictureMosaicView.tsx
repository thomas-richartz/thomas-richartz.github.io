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

  // Ultra-wide: take full row (6x1)
  if (ratio > 4.0) return { colSpan: 6, rowSpan: 1 };
  // Wide: take 3 cells horizontally
  if (ratio > 1.5) return { colSpan: 3, rowSpan: 1 };
  // Ultra-tall: take full column (1x6)
  if (ratio < 0.25) return { colSpan: 1, rowSpan: 6 };
  // Tall: take 3 cells vertically
  if (ratio < 0.67) return { colSpan: 1, rowSpan: 3 };
  // Square or near-square
  return { colSpan: 1, rowSpan: 1 };
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

/**
 * Returns an array of { image, placement } for images that fit in the grid.
 * Only as many images as will fit in the grid (based on their spans) are returned.
 */
const calculatePlacements = (images: GalleryImage[]): { image: GalleryImage; placement: GridPlacement }[] => {
  const grid = Array(GRID.SIZE)
    .fill(null)
    .map(() => Array(GRID.SIZE).fill(false));

  // Sort images by max(colSpan, rowSpan) first, then by area (largest first)
  const sortedImagesWithIndices = images
    .map((img, index) => {
      const width = img.width || 1;
      const height = img.height || 1;
      const { colSpan, rowSpan } = calculateImageSpans(width, height);
      return { img, index, colSpan, rowSpan };
    })
    .sort((a, b) => {
      const aMaxSpan = Math.max(a.colSpan, a.rowSpan);
      const bMaxSpan = Math.max(b.colSpan, b.rowSpan);
      if (bMaxSpan !== aMaxSpan) return bMaxSpan - aMaxSpan;
      const aArea = (a.img.width || 1) * (a.img.height || 1);
      const bArea = (b.img.width || 1) * (b.img.height || 1);
      return bArea - aArea;
    });

  const result: { image: GalleryImage; placement: GridPlacement }[] = [];

  for (const { img, colSpan, rowSpan } of sortedImagesWithIndices) {
    const placement = findAvailablePosition(grid, colSpan, rowSpan);
    if (placement) {
      result.push({ image: img, placement });
    }
    // Stop if grid is full
    const usedCells = grid.flat().filter(Boolean).length;
    if (usedCells >= GRID.SIZE * GRID.SIZE) break;
  }

  return result;
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

const MosaicGroup = ({ group, onImageClick }: { group: MosaicGroup; onImageClick: (filename: string) => void }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, { width: number; height: number }>>({});
  const [placedImages, setPlacedImages] = useState<{ image: GalleryImage; placement: GridPlacement }[]>([]);

  // Recalculate placements whenever loadedImages or group.images changes
  useEffect(() => {
    const imagesWithDimensions = group.images.map((img) => ({
      ...img,
      width: loadedImages[img.filename]?.width,
      height: loadedImages[img.filename]?.height,
    }));

    // Only as many images as will fit in the grid will be placed
    const newPlacedImages = calculatePlacements(imagesWithDimensions);
    setPlacedImages(newPlacedImages);
  }, [loadedImages, group.images]);

  const handleImageLoad = (image: GalleryImage, width: number, height: number) => {
    setLoadedImages((prev) => ({
      ...prev,
      [image.filename]: { width, height },
    }));
  };

  return (
    <div className={styles.mosaicGroup}>
      {placedImages.map(({ image, placement }) => (
        <MosaicImage key={image.filename} image={image} placement={placement} onClick={() => onImageClick(image.filename)} onLoad={handleImageLoad} />
      ))}
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
  const [showImageId, setShowImageId] = useState<string | null>(null);

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
      if (showImageId === null) return;
      const currentIndex = images.findIndex((img) => img.filename === showImageId);
      if (currentIndex === -1) return;
      if (dx > 0) {
        const prevIdx = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
        setShowImageId(images[prevIdx].filename);
      }
      if (dx < 0) {
        const nextIdx = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
        setShowImageId(images[nextIdx].filename);
      }
    },
  });

  const currentIndex = showImageId !== null ? images.findIndex((img) => img.filename === showImageId) : -1;
  const currentImage = currentIndex !== -1 ? images[currentIndex] : null;

  return (
    <div ref={containerRef} className={styles.mosaicContainer}>
      {mosaicGroups.map((group) => (
        <MosaicGroup key={`group-${group.startIndex}`} group={group} onImageClick={setShowImageId} />
      ))}

      <div ref={loaderRef} className={styles.loader} />

      {showImageId !== null && currentImage && (
        <div {...bindGesture()} tabIndex={-1}>
          <IntenseImage
            alt={currentImage.title}
            title={currentImage.title}
            category={currentImage.cat}
            src={`assets/images/${currentImage.filename}`}
            nextImage={() => {
              const nextIdx = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
              setShowImageId(images[nextIdx].filename);
            }}
            prevImage={() => {
              const prevIdx = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
              setShowImageId(images[prevIdx].filename);
            }}
            onClose={() => setShowImageId(null)}
            isOpen
          />
        </div>
      )}
    </div>
  );
}
