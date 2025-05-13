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

  const ref = useRef<HTMLDivElement | HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

  const zoomTransition = useTransition(!isLoading, {
    from: { transform: "scale(0.79)", opacity: 0 },
    enter: { transform: "scale(1.0)", opacity: 1 },
    leave: { transform: "scale(1.2)", opacity: 0 },
    delay: 500,
  });

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

  if (isLoading) {
    return <Spinner onClick={() => {}} />;
  }

  return zoomTransition(
    (styles, item) =>
      item && (
        <animated.img
          loading="lazy"
          alt={alt}
          style={styles}
          className={className} // Apply className here
          src={currentSrc}
        />
      ),
  );
};
