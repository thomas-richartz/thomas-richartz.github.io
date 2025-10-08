import React, { useState, useEffect, useRef, useCallback } from "react";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useSpring, animated } from "@react-spring/web";
import { GalleryImage } from "@/types";
import { categoryInterpretations } from "@/assets/interpretations";
import styles from "./RandomPictureParallaxView.module.css";

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
        fontSize: "0.95rem",
        letterSpacing: "0.03rem",
        fontWeight: "400",
        color: "#e0e0e0",
        padding: "1rem 0",
      }}
    >
      {text}
    </animated.div>
  );
};

const ParallaxImageLayer: React.FC<{
  image: GalleryImage;
  index: number;
  total: number;
  isWide: boolean;
  interpretation: string;
  play: boolean;
  onSnap: (idx: number) => void;
  snapped: boolean;
}> = ({ image, index, total, isWide, interpretation, play, onSnap, snapped }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [textScrolled, setTextScrolled] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Detect aspect ratio for salon wall span
  useEffect(() => {
    if (imageRef.current?.complete) {
      setDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, [imageRef.current]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }, []);

  const imgAspect = dimensions ? dimensions.width / dimensions.height : 1;

  // Parallax speed: taller images move faster
  const speed = Math.max(0.3, Math.min(1.2, imgAspect < 0.8 ? 1.2 : 0.5 + (1.2 - Math.min(imgAspect, 1.2))));

  // Snap logic: if text is scrollable, pause until user scrolls to bottom
  useEffect(() => {
    if (!textRef.current) return;
    const el = textRef.current;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        setTextScrolled(true);
        onSnap(index + 1); // Allow next image to scroll
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [index, onSnap]);

  // If not playing, or not snapped, don't allow scroll past this layer
  const canScroll = play && (snapped || !interpretation);

  return (
    <ParallaxLayer
      offset={index * 1.2}
      speed={speed}
      factor={1}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 2,
        pointerEvents: canScroll ? "auto" : "none",
      }}
    >
      <div
        className={isWide ? styles.wideImageCard : styles.imageCard}
        style={{
          margin: "0 auto",
          marginBottom: "2.5rem",
          width: isWide ? "90vw" : "60vw",
          maxWidth: isWide ? 1200 : 600,
          minHeight: 320,
          background: "#181818",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Category label */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "#222",
            fontWeight: "bold",
            fontSize: "1.05rem",
            padding: "0.5rem 0.7rem",
            borderRadius: "12px 12px 0 0",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            zIndex: 2,
          }}
        >
          {image.cat}
        </div>
        {/* Image */}
        <img
          ref={imageRef}
          onLoad={handleImageLoad}
          src={`/assets/images/${image.filename}`}
          alt={image.title}
          title={image.title}
          style={{
            width: "100%",
            height: isWide ? "340px" : "260px",
            objectFit: "cover",
            display: "block",
            borderRadius: "0",
            flexShrink: 0,
          }}
          loading="lazy"
        />
        {/* Title below image */}
        <div
          style={{
            background: "rgba(17, 17, 17, 0.92)",
            color: "#f0f0f0",
            borderTop: "1px solid #333",
            borderRadius: "0 0 12px 12px",
            padding: "0.7rem",
            fontSize: "1.1rem",
            textAlign: "center",
            minHeight: "2.5em",
            overflow: "auto",
            fontWeight: 500,
          }}
        >
          {image.title}
        </div>
        {/* Interpretation text layer */}
        {interpretation && (
          <div
            ref={textRef}
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              background: "rgba(30,30,30,0.96)",
              color: "#ffe",
              fontSize: "1rem",
              padding: "1rem",
              borderTop: "1px solid #444",
              borderRadius: "0 0 12px 12px",
              marginTop: "0.2rem",
              fontStyle: "italic",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <InfoText text={interpretation} />
            {!textScrolled && <div style={{ textAlign: "center", fontSize: "0.85em", color: "#aaa", marginTop: 8 }}>Scroll to continue</div>}
          </div>
        )}
      </div>
    </ParallaxLayer>
  );
};

export const RandomPictureParallaxView: React.FC<{
  images: GalleryImage[];
  loadRandomImages?: (count: number) => GalleryImage[];
  setImages?: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}> = ({ images, loadRandomImages, setImages }) => {
  const parallaxRef = useRef<any>(null);
  const [play, setPlay] = useState(true);
  const [snappedIdx, setSnappedIdx] = useState(0);

  // Responsive: recalc on resize
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (!play || !parallaxRef.current) return;
    let raf: number;
    const scrollStep = () => {
      if (!parallaxRef.current) return;
      parallaxRef.current.scrollTo(parallaxRef.current.current / 1.015 + 0.001);
      raf = requestAnimationFrame(scrollStep);
    };
    raf = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  // Snap logic: when a text layer is scrollable, pause auto-scroll until user scrolls to bottom
  const handleSnap = (idx: number) => {
    setSnappedIdx(idx);
    setPlay(false);
  };

  // Wide image detection - using the cached dimensions from the ParallaxImageLayer component
  const isWide = (img: GalleryImage) => {
    const imgEl = document.querySelector(`img[src="/assets/images/${img.filename}"]`) as HTMLImageElement;
    return imgEl && imgEl.complete ? imgEl.width / imgEl.height > 1.2 : false;
  };

  // Parallax pages: one per image, with extra space
  const totalPages = images.length * 1.2 + 1;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111", position: "relative" }}>
      <Parallax ref={parallaxRef} pages={totalPages}>
        {/* Optional: background parallax layers for depth */}
        <ParallaxLayer offset={0} speed={0.1} factor={totalPages} style={{ zIndex: 0 }}>
          <div style={{ width: "100vw", height: "100%", background: "linear-gradient(to bottom, #222, #111 80%)" }} />
        </ParallaxLayer>
        {/* Main image layers */}
        {images.map((img, idx) => (
          <ParallaxImageLayer
            key={img.filename + "-" + idx}
            image={img}
            index={idx}
            total={images.length}
            isWide={isWide(img)}
            interpretation={categoryInterpretations[img.cat] || ""}
            play={play && snappedIdx <= idx}
            onSnap={handleSnap}
            snapped={snappedIdx > idx}
          />
        ))}
      </Parallax>
      {/* Play/Pause Button */}
      <button
        onClick={() => setPlay((p) => !p)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: play ? "#222" : "#444",
          color: "#ffe",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          fontSize: "2rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        aria-label={play ? "Pause auto-scroll" : "Play auto-scroll"}
      >
        {play ? "❚❚" : "▶"}
      </button>
    </div>
  );
};

export default RandomPictureParallaxView;
