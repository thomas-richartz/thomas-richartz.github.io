import React, { MouseEventHandler, useEffect, useState } from "react";
import { useTransition, animated, useSpring } from "@react-spring/web";
import { Spinner } from "./Spinner";
import styles from "./LightBoxImage.module.css";

type LightBoxImageProps = {
  alt: string;
  src: string;
  className: string;
  onClick: MouseEventHandler<HTMLImageElement> | undefined;
};

export const LightBoxImage = ({
  alt,
  src,
  className,
  onClick,
}: LightBoxImageProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  const imgTransitions = useTransition(!isLoading, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    delay: 200,
  });

  const blurPulse = useSpring({
    loop: { reverse: true },
    from: { transform: "scale(1.05)", opacity: 0.4 },
    to: { transform: "scale(1.5)", opacity: 0.8 },
    config: { duration: 6000, easing: (t) => t },
  });

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setIsLoading(false);
      setCurrentSrc(src);
    };
  }, [src]);

  if (isLoading) {
    return <Spinner onClick={onClick} />;
  }

  return imgTransitions(
    (style, item) =>
      item && (
        <div className={styles.lightBoxWrapper}>
          <animated.img
            src={currentSrc}
            alt={alt}
            className={styles.light}
            style={{
              ...style,
              ...blurPulse,
              position: "absolute",
              filter: "blur(35px)",
              zIndex: 0,
              top: 0,
              left: 0,
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <animated.img
            loading="lazy"
            alt={alt}
            style={{
              ...style,
              position: "relative",
              zIndex: 1,
            }}
            className={`${className} ${styles.main}`}
            src={currentSrc}
            onClick={onClick}
          />
        </div>
      ),
  );
};
