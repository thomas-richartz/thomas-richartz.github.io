import React, { useState, useEffect, useRef, useCallback } from "react";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useSpring, animated, config } from "@react-spring/web";
import { GalleryImage } from "@/types";
import { categoryInterpretations } from "@/assets/interpretations";
import styles from "./RandomPictureParallaxView.module.css";

const SCROLL_SPEED_BASE = 0.5;
const MOBILE_BREAKPOINT = 768;

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
  isMobile: boolean;
}> = ({ image, index, total, isWide, interpretation, play, onSnap, snapped, isMobile }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const [textScrolled, setTextScrolled] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Image load handling
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }, []);

  // Calculate dynamic speeds based on position and dimensions
  const imgAspect = dimensions ? dimensions.width / dimensions.height : 1;
  const baseSpeed = SCROLL_SPEED_BASE + (index % 3) * 0.2; // Vary speed by position
  const speed = Math.max(0.3, Math.min(1.2, baseSpeed * (imgAspect < 1 ? 1 : 0.8)));

  // Zoom and fade animations
  const [springs, api] = useSpring(() => ({
    scale: 1,
    opacity: 0,
    config: config.gentle,
  }));

  // Visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            api.start({ scale: 1, opacity: 1 });
          } else {
            setIsVisible(false);
            api.start({ scale: 0.95, opacity: 0 });
          }
        });
      },
      { threshold: 0.1, rootMargin: "20% 0px" },
    );

    if (layerRef.current) {
      observer.observe(layerRef.current);
    }

    return () => observer.disconnect();
  }, [api]);

  // Scroll handling
  useEffect(() => {
    if (!textRef.current) return;
    const el = textRef.current;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        setTextScrolled(true);
        onSnap(index + 1);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [index, onSnap]);

  const canScroll = play && (snapped || !interpretation);

  return (
    <ParallaxLayer
      offset={index * (isMobile ? 1.1 : 1.2)}
      speed={speed}
      factor={1}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: isVisible ? total - index : 1,
        pointerEvents: canScroll ? "auto" : "none",
        position: "relative",
      }}
    >
      <animated.div
        ref={layerRef}
        style={{
          ...springs,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className={isWide ? styles.wideImageCard : styles.imageCard}
          style={{
            margin: "0 auto",
            marginBottom: isMobile ? "1.5rem" : "2.5rem",
            width: isMobile ? "95vw" : isWide ? "85vw" : "60vw",
            maxWidth: isWide ? 1000 : 600,
            minHeight: isMobile ? 280 : 320,
            background: "#181818",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#222",
              fontWeight: "bold",
              fontSize: isMobile ? "0.95rem" : "1.05rem",
              padding: "0.5rem 0.7rem",
              borderRadius: "12px 12px 0 0",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              zIndex: 2,
            }}
          >
            {image.cat}
          </div>
          <img
            ref={imageRef}
            onLoad={handleImageLoad}
            src={`/assets/images/${image.filename}`}
            alt={image.title}
            title={image.title}
            style={{
              width: "100%",
              height: isMobile ? "240px" : isWide ? "440px" : "260px",
              objectFit: "contain",
              display: "block",
              borderRadius: "0",
              flexShrink: 0,
              transition: "transform 0.3s ease-out",
              transform: isVisible ? "scale(1)" : "scale(1.05)",
            }}
            loading="lazy"
          />
          <div
            style={{
              background: "rgba(17, 17, 17, 0.92)",
              color: "#f0f0f0",
              borderTop: "1px solid #333",
              borderRadius: "0 0 12px 12px",
              padding: "0.7rem",
              fontSize: isMobile ? "1rem" : "1.1rem",
              textAlign: "center",
              minHeight: "2.5em",
              overflow: "auto",
              fontWeight: 500,
            }}
          >
            {image.title}
          </div>
          {interpretation && (
            <div
              ref={textRef}
              style={{
                maxHeight: isMobile ? "100px" : "120px",
                overflowY: "auto",
                background: "rgba(30,30,30,0.96)",
                color: "#ffe",
                fontSize: isMobile ? "0.9rem" : "1rem",
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
      </animated.div>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Enhanced auto-scroll with dynamic speed
  useEffect(() => {
    if (!play || !parallaxRef.current) return;
    let raf: number;
    let lastTime = performance.now();
    const scrollStep = (currentTime: number) => {
      if (!parallaxRef.current) return;
      const deltaTime = currentTime - lastTime;
      const scrollSpeed = isMobile ? 0.0005 : 0.0008;
      parallaxRef.current.scrollTo(parallaxRef.current.current + scrollSpeed * deltaTime);
      lastTime = currentTime;
      raf = requestAnimationFrame(scrollStep);
    };
    raf = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(raf);
  }, [play, isMobile]);

  const handleSnap = (idx: number) => {
    setSnappedIdx(idx);
    setPlay(false);
  };

  const isWide = useCallback((img: GalleryImage) => {
    const imgEl = document.querySelector(`img[src="/assets/images/${img.filename}"]`) as HTMLImageElement;
    return imgEl && imgEl.complete ? imgEl.width / imgEl.height > 1.2 : false;
  }, []);

  const totalPages = images.length * (isMobile ? 1.3 : 1.4) + 1;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111", position: "relative" }}>
      <Parallax ref={parallaxRef} pages={totalPages}>
        <ParallaxLayer offset={0} speed={0.1} factor={totalPages} style={{ zIndex: 0 }}>
          <div
            style={{
              width: "100vw",
              height: "100%",
              background: "linear-gradient(to bottom, #222, #111 80%)",
            }}
          />
        </ParallaxLayer>
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
            isMobile={isMobile}
          />
        ))}
      </Parallax>
      <button
        onClick={() => setPlay((p) => !p)}
        style={{
          position: "fixed",
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 100,
          background: play ? "#222" : "#444",
          color: "#ffe",
          border: "none",
          borderRadius: "50%",
          width: isMobile ? 48 : 56,
          height: isMobile ? 48 : 56,
          fontSize: isMobile ? "1.7rem" : "2rem",
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
