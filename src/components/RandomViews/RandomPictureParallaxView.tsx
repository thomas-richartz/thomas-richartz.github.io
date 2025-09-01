import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { GalleryImage } from "@/types";
import { useSpring, animated } from "@react-spring/web";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import styles from "./RandomPictureParallaxView.module.css"; // Reuse grid styles for responsiveness
import { categoryInterpretations } from "@/assets/interpretations";

interface RandomPictureParallaxViewProps {
  images: GalleryImage[];
  loadRandomImages?: (count: number) => GalleryImage[];
  setImages?: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}

const InfoText: React.FC<{ text: string }> = ({ text }) => {
  const spring = useSpring({
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 140, friction: 20 },
  });
  return (
    <animated.div
      style={{
        ...spring,
        fontSize: "0.85rem",
        letterSpacing: "0.03rem",
        fontWeight: "300",
        color: "#e0e0e0",
      }}
      className={styles.infoText}
    >
      {text}
    </animated.div>
  );
};

const ParallaxImage: React.FC<{
  image: GalleryImage;
  index: number;
  isCenter: boolean;
  scrollY: number;
}> = ({ image, index, isCenter, scrollY }) => {
  // Parallax effect for image
  const spring = useSpring({
    scale: isCenter ? 1.15 : 1,
    opacity: isCenter ? 1 : 0.85,
    brightness: isCenter ? 1 : 0.85,
    y: isCenter ? -20 : 0,
    rotateZ: isCenter ? 0 : index % 2 === 0 ? -1 : 1,
    config: { tension: 180, friction: 24 },
  });

  // Calculate parallax offset based on scroll position and index
  // Make different images move at different speeds
  const parallaxFactor = ((index % 3) + 1) * 0.2;
  const parallaxOffset = scrollY * 0.05 * parallaxFactor;

  // Determine the hover effect direction based on index
  const hoverX = index % 2 === 0 ? -5 : 5;
  const hoverY = index % 3 === 0 ? -5 : 5;

  return (
    <animated.div
      className="drei-img"
      style={{
        ...spring,
        transform: spring.scale.to((s) => `scale(${s}) translateY(${spring.y.get() + parallaxOffset}px) rotateZ(${spring.rotateZ.get()}deg)`),
        zIndex: isCenter ? 10 : 1,
        borderRadius: "2px",
        overflow: "hidden",
        background: "#111",
        position: "relative",
        transition: "box-shadow 0.3s ease-out",
        cursor: isCenter ? "zoom-in" : "pointer",
        boxShadow: isCenter ? "0 20px 25px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.05)" : "0 5px 15px rgba(0,0,0,0.3)",
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        filter: spring.brightness.to((b) => `brightness(${b})`),
        transformOrigin: "center center",
      }}
      tabIndex={0}
      aria-label={`Image ${image.title}`}
      onMouseEnter={() => {
        spring.scale.start(isCenter ? 1.2 : 1.05);
        spring.brightness.start(isCenter ? 1.1 : 0.95);
        spring.y.start(isCenter ? -25 : hoverY);
        spring.rotateZ.start(isCenter ? 0 : index % 2 === 0 ? -1.5 : 1.5);
      }}
      onMouseLeave={() => {
        spring.scale.start(isCenter ? 1.15 : 1);
        spring.brightness.start(isCenter ? 1 : 0.85);
        spring.y.start(isCenter ? -20 : 0);
        spring.rotateZ.start(isCenter ? 0 : index % 2 === 0 ? -1 : 1);
      }}
    >
      <img
        src={`/assets/images/${image.filename}`}
        alt={image.title}
        title={image.title}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          flex: "1 1 auto",
          borderRadius: "2px 2px 0 0",
          transition: "transform 0.5s ease-out",
        }}
        loading="lazy"
      />
      <div
        style={{
          padding: "0.7rem",
          background: "rgba(17, 17, 17, 0.85)",
          backdropFilter: "blur(5px)",
          color: "#f0f0f0",
          borderTop: "1px solid #333",
        }}
      >
        <InfoText text={image.title} />
      </div>
    </animated.div>
  );
};

export const RandomPictureParallaxView: React.FC<RandomPictureParallaxViewProps> = ({ images, loadRandomImages, setImages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerImg, setCenterImg] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Infinite scroll loading
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const lastScrollY = useRef(0);
  const loadingRef = useRef(false);

  // Mouse parallax effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleScroll = () => {
      // Update scroll position for parallax effects
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Determine scroll direction
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      lastScrollY.current = currentScrollY;

      // Calculate scroll position and check if we're near the bottom
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY + windowHeight;
      const scrollThreshold = documentHeight - 300; // Load more when 300px from bottom

      // Load more images when scrolling near the bottom
      if (scrollPosition >= scrollThreshold && !loadingRef.current) {
        if (setImages && loadRandomImages) {
          loadingRef.current = true;
          console.log("Loading more images near bottom:", {
            scrollPosition,
            documentHeight,
            threshold: scrollThreshold,
          });

          // Load new images with a slight delay to prevent rapid loading
          const newImages = loadRandomImages(8);
          setImages((prev) => {
            // Reset loading flag after a short delay
            setTimeout(() => {
              loadingRef.current = false;
            }, 800);
            return [...prev, ...newImages];
          });
        }
      }

      // Find center image with improved detection
      if (containerRef.current) {
        const imgs = containerRef.current.querySelectorAll(".drei-img");
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        let closestIdx = null;
        let closestDist = Infinity;
        imgs.forEach((el: Element, idx: number) => {
          const rect = el.getBoundingClientRect();
          const imgCenter = rect.top + rect.height / 2 + window.scrollY;
          const dist = Math.abs(imgCenter - viewportCenter);
          if (dist < closestDist && dist < 300) {
            // Only select if truly close to center
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

  // Responsive grid logic
  const memoImages = useMemo(() => images, [images]);

  // Gallery header animation with enhanced effects
  const headerSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-30px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 120, friction: 18 },
    delay: 100,
  });

  // Build category layers with enhanced visual effects
  const layers: React.ReactNode[] = [];
  let lastCat: string | null = null;
  memoImages.forEach((img, idx) => {
    if (img.cat !== lastCat) {
      // Calculate parallax offsets for category headers that respond to both scroll and mouse position
      const catScrollParallax = scrollY * 0.03;
      const catMouseParallaxX = mousePosition.x * 10;
      const catMouseParallaxY = mousePosition.y * 5;

      // Enhanced visual appeal for category headers
      layers.push(
        <animated.div
          key={`cat-${img.cat}`}
          style={{
            width: "100%",
            margin: "5rem 0 2.5rem 0",
            padding: "2rem 0",
            background: "linear-gradient(to right, rgba(10,10,10,0.9), rgba(20,20,20,0.95), rgba(10,10,10,0.9))",
            borderLeft: "3px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            transform: `translateY(${catScrollParallax}px) translateX(${catMouseParallaxX}px)`,
            textAlign: "center",
            position: "relative",
            zIndex: 5,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              color: "#f0f0f0",
              textShadow: "0 0 10px rgba(255,255,255,0.3)",
            }}
          >
            {img.cat}
          </div>
          <div
            style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#b0b0b0",
              whiteSpace: "pre-line",
              maxWidth: "900px",
              margin: "0 auto",
              padding: "0 2rem",
              textShadow: "0 0 5px rgba(0,0,0,0.5)",
            }}
          >
            {categoryInterpretations[img.cat] ? categoryInterpretations[img.cat].substring(0, 300) + "..." : ""}
          </div>
        </animated.div>,
      );
      lastCat = img.cat;
    }

    // Distribute images with varying parallax speeds
    const speedFactor = (idx % 5) * 0.1 + 0.8; // Creates varying speeds
    const directionFactor = scrollDirection === "down" ? 1 : -1;

    // Ensure unique keys by combining filename with index
    // This is critical for preventing React key warnings
    // We use a combination of filename (sanitized) and index to ensure uniqueness
    const sanitizedFilename = img.filename.replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueKey = `image-${sanitizedFilename}-${idx}`;

    layers.push(<ParallaxImage key={uniqueKey} image={img} index={idx} isCenter={idx === centerImg} scrollY={scrollY * speedFactor * directionFactor} />);
  });

  // Calculate dynamic pages based on number of images
  // More images = more pages to scroll through
  // The divisor (6) controls how many images fit on one "page"
  const imagesPerPage = 6;
  const totalPages = Math.max(3, Math.ceil(images.length / imagesPerPage) + 1); // Add extra page for loading more

  // Check if we're in a browser environment before rendering
  const isClient = typeof window !== "undefined";

  // Log the page calculation for debugging
  useEffect(() => {
    console.log(`Parallax pages: ${totalPages} for ${images.length} images`);
  }, [images.length, totalPages]);

  return (
    <Parallax pages={totalPages} style={{ background: "linear-gradient(to bottom, #000000, #111111, #000000)" }}>
      {/* Floating particles in background for atmosphere */}
      <ParallaxLayer offset={0} speed={0.1} factor={3} style={{ pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            style={{
              position: "absolute",
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 300}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.1,
              boxShadow: "0 0 5px rgba(255,255,255,0.3)",
            }}
          />
        ))}
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-100px); }
              100% { transform: translateY(-200px); }
            }
          `}
        </style>
      </ParallaxLayer>

      {/* Gallery Title & Description with enhanced parallax */}
      <ParallaxLayer offset={0} speed={0.7} style={{ zIndex: 10 }}>
        <animated.div
          style={{
            ...headerSpring,
            transform: `translateY(${headerSpring.transform}) translateX(${mousePosition.x * 20}px)`,
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "3.5rem",
              margin: "3rem 0 1.5rem 0",
              color: "#f0f0f0",
              textShadow: "0 0 20px rgba(255,255,255,0.3)",
              letterSpacing: "0.2rem",
            }}
          >
            Parallax Gallery
          </h1>
          <p
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#b0b0b0",
              marginBottom: "3rem",
              letterSpacing: "0.1rem",
              textShadow: "0 0 10px rgba(0,0,0,0.8)",
            }}
          >
            SCROLL TO EXPLORE • THE WORKS REVEAL THEMSELVES • INTERPRETATIONS UNFOLD
          </p>
        </animated.div>
      </ParallaxLayer>

      {/* Subtle parallax effect layer for depth */}
      <ParallaxLayer offset={0.2} speed={0.5} style={{ opacity: 0.2 }}>
        <div
          style={{
            height: "20%",
            background: "linear-gradient(to bottom, transparent, rgba(50,50,50,0.1), transparent)",
            transform: `translateX(${mousePosition.x * -30}px)`,
          }}
        />
      </ParallaxLayer>

      {/* Main content - Parallax Grid of Images and Category Layers */}
      <ParallaxLayer offset={0.5} speed={0.3} style={{ zIndex: 2 }} factor={totalPages - 0.5}>
        <div
          ref={containerRef}
          className={styles.gridContainer}
          style={{
            position: "relative",
            zIndex: 2,
            background: "transparent",
            gap: "2.5rem",
            padding: "2rem",
            paddingBottom: "50vh", // Extra padding at bottom to ensure scroll triggering
            transform: isClient ? `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * -5}px)` : "none",
            transition: "transform 0.1s ease-out",
            minHeight: `${totalPages * 100}vh`, // Ensure container height scales with content
          }}
        >
          {layers}

          {/* Add loading indicator at the bottom */}
          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "2rem",
              color: "#f0f0f0",
              fontSize: "1.2rem",
              opacity: loadingRef.current ? 0.7 : 0,
              transition: "opacity 0.3s ease",
              height: "100px",
              marginTop: "2rem",
            }}
          >
            {loadingRef.current ? "Loading more artworks..." : "Scroll for more"}
          </div>
        </div>
      </ParallaxLayer>
    </Parallax>
  );
};

export default RandomPictureParallaxView;

// Add CSS animation for the parallax effect
const parallaxStyles = `
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 5px rgba(255,255,255,0.1); }
    50% { box-shadow: 0 0 15px rgba(255,255,255,0.2); }
    100% { box-shadow: 0 0 5px rgba(255,255,255,0.1); }
  }
`;

// Inject the styles into the document
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = parallaxStyles;
  document.head.appendChild(styleElement);
}
