import React, { MouseEventHandler, useEffect, useState } from "react";
import { useTransition, animated } from "@react-spring/web";
import { Spinner } from "./Spinner";
// import styles from "./LightBoxImage.module.css"

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
    (styles, item) =>
      item && (
        <animated.img
          loading="lazy"
          alt={alt}
          style={styles}
          className={className}
          src={currentSrc}
          onClick={onClick}
        />
      )
  );
};
