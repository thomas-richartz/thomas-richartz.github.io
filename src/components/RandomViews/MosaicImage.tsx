import React, { ReactNode } from "react";
import { GalleryImage } from "../../types";
import { animated, useSpring } from "react-spring";

const MosaicImage: React.FC<{
  img: GalleryImage;
  isCenter: boolean;
  scrollY: number;
  parallaxY: number;
  categoryHeader: React.ReactNode;
}> = ({ img, isCenter, scrollY, parallaxY, categoryHeader }) => {
  const spring = useSpring({
    scale: isCenter ? 1.15 : 1,
    opacity: isCenter ? 1 : 0.85,
    brightness: isCenter ? 1 : 0.8,
    y: isCenter ? -20 : 0,
    zIndex: isCenter ? 10 : 1,
    config: { tension: 200, friction: 26 },
  });

  return (
    <animated.div
      key={img.filename}
      className="mosaic-img"
      style={{
        ...spring,
        transform: spring.scale.to((s) => `scale(${s}) translateY(${parallaxY + spring.y.get()}px)`),
        zIndex: spring.zIndex,
        borderRadius: "2px",
        overflow: "hidden",
        background: "#111",
        position: "relative",
        transition: "all 0.3s ease-out",
        cursor: isCenter ? "zoom-in" : "pointer",
        boxShadow: isCenter ? "0 0 25px rgba(0,0,0,0.7)" : "0 0 5px rgba(0,0,0,0.5)",
        filter: spring.brightness.to((b) => `brightness(${b})`),
      }}
      tabIndex={0}
      aria-label={`Image ${img.title}`}
    >
      <img
        src={`/assets/images/${img.filename}`}
        alt={img.title}
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          borderRadius: "2px 2px 0 0",
        }}
        loading="lazy"
      />
      <div
        style={{
          padding: "0.7rem",
          textAlign: "left",
          fontWeight: isCenter ? "500" : "normal",
          fontSize: isCenter ? "0.9rem" : "0.8rem",
          letterSpacing: "0.03rem",
          color: "#e0e0e0",
          background: "#111",
          borderTop: "1px solid #222",
          transform: isCenter ? "translateY(0)" : "translateY(0)",
          transition: "transform 0.3s ease-out",
        }}
      >
        {categoryHeader}
        {img.title}
        {isCenter && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#999",
              marginTop: "0.4rem",
              letterSpacing: "0.02rem",
              fontWeight: "300",
              transform: "translateY(0)",
              maxHeight: "80px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {img.interpretation ?? ""}
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default MosaicImage;
