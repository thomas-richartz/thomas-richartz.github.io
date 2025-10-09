import { useEffect, useRef, useState, useMemo } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import type { GalleryImage } from "@/types";
import { IntenseImage } from "@/components/IntenseImage";
import styles from "./RandomPictureMosaicView.module.css";

interface MosaicGroup {
  images: GalleryImage[];
  isPortrait: boolean;
  startIndex: number;
}

const IMAGES_PER_GROUP = 4;

function createMosaicGroups(images: GalleryImage[]): MosaicGroup[] {
  const groups: MosaicGroup[] = [];

  for (let i = 0; i < images.length; i += IMAGES_PER_GROUP) {
    const groupImages = images.slice(i, i + IMAGES_PER_GROUP);
    const isPortrait = i % 2 === 0;

    if (groupImages.length > 0) {
      groups.push({
        images: groupImages,
        isPortrait,
        startIndex: i,
      });
    }
  }

  return groups;
}

const MosaicImage = ({
  image,
  onClick,
  isFeature,
  isLastInGroup,
  groupLength,
}: {
  image: GalleryImage;
  onClick: () => void;
  isFeature: boolean;
  isLastInGroup: boolean;
  groupLength: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = window.innerWidth <= 768;

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
        gridColumn: isFeature && !isMobile ? "span 2" : isLastInGroup && groupLength % 2 === 1 ? "span 2" : "auto",
        gridRow: isFeature && !isMobile ? "span 2" : "auto",
      }}
    >
      <div className={`${styles.imageContainer} ${isLoaded ? styles.loaded : ""}`}>
        <img src={`/assets/images/${image.filename}`} alt={image.title} loading="lazy" className={styles.mosaicImage} onLoad={() => setIsLoaded(true)} />
        <animated.div className={styles.overlay} style={overlaySpring}>
          <h3>{image.title}</h3>
          <span>{image.cat}</span>
        </animated.div>
      </div>
    </div>
  );
};

const MosaicGroup = ({ group, onImageClick }: { group: MosaicGroup; onImageClick: (index: number) => void }) => {
  const isMobile = window.innerWidth <= 768;
  const isWide = window.innerWidth >= 1440;

  const getGridTemplate = () => {
    if (group.isPortrait) {
      return {
        columns: isMobile ? "1fr 1fr" : isWide ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr",
        rows: isMobile ? "repeat(3, 1fr)" : isWide ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
      };
    }
    return {
      columns: isMobile ? "1fr 1fr" : isWide ? "repeat(4, 1fr)" : "repeat(3, 1fr)",
      rows: isMobile ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
    };
  };

  const { columns, rows } = getGridTemplate();

  return (
    <div
      className={styles.mosaicGroup}
      style={{
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
      }}
    >
      {group.images.map((img, idx) => (
        <MosaicImage
          key={img.filename}
          image={img}
          onClick={() => onImageClick(group.startIndex + idx)}
          isFeature={idx === 0}
          isLastInGroup={idx === group.images.length - 1}
          groupLength={group.images.length}
        />
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
  const [showIndex, setShowIndex] = useState<number | null>(null);

  const mosaicGroups = useMemo(() => createMosaicGroups(images), [images]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setImages((prev) => [...prev, ...loadRandomImages(IMAGES_PER_GROUP * 2)]);
        }
      },
      {
        rootMargin: "200px",
      },
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
