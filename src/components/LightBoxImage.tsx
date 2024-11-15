import React, { MouseEventHandler, useEffect, useState } from "react";
import { useTransition, animated } from "@react-spring/web";
import { Spinner } from "./Spinner";

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
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [currentSrc, setCurrentSrc] = useState<string>(src); // Manage current source

  // Transition for the image appearance
  const imgTransitions = useTransition(!isLoading, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 300 }, // Smooth transition
  });

  // Preload image
  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setCurrentSrc(src); // Update the source
      setIsLoading(false); // Mark loading as complete
    };
    return () => {
      image.onload = null; // Cleanup to avoid memory leaks
    };
  }, [src]);

  return (
    <>
      {isLoading ? (
        <Spinner onClick={onClick} /> // Show spinner while loading
      ) : (
        imgTransitions(
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
        )
      )}
    </>
  );
};
