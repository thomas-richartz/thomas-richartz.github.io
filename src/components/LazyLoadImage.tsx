import React, { useEffect, useRef, useState } from "react";
import { useTransition, animated } from "@react-spring/web";
import { useIntersectionObserver } from "usehooks-ts";
import styles from "./LazyLoadImage.module.css";
import lightBoxStyles from "./LightBoxImage.module.css";
import { Spinner } from "./Spinner";

interface ILazyLoadImage {
  alt: string;
  src: string;
  className?: string;
}

export const LazyLoadImage = ({ alt, src, className }: ILazyLoadImage) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState("");
  const [shouldRender, setShouldRender] = useState(false);

  const ref = useRef<HTMLDivElement | HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

  const zoomTransition = useTransition(shouldRender, {
    from: { transform: "scale(0.79)", opacity: 1 },
    enter: { transform: "scale(1.0)", opacity: 1 },
    leave: { transform: "scale(1.2)", opacity: 0 },
    delay: 500,
    initial: null,
  });

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isVisible) {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        setIsLoading(false);
        setCurrentSrc(src);
      };
    }
  }, [src, isVisible]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {isLoading ? (
        <div
          style={{ position: "absolute", top: "0", left: "0" }}
          className={lightBoxStyles.spinnerWrapper}
        >
          <Spinner onClick={() => {}} />
        </div>
      ) : (
        zoomTransition(
          (style, item) =>
            item && (
              <animated.img
                loading="lazy"
                alt={alt}
                style={{
                  ...style,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                src={currentSrc}
              />
            ),
        )
      )}
    </div>
  );
};
