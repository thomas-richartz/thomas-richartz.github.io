import React, { useState, useEffect } from "react";
import styles from "./SpaceImage.module.css";

type SpaceImageProps = {
  /**
   * The source URL of the image
   */
  src: string;

  /**
   * Alternative text for the image
   */
  alt: string;

  /**
   * Optional title for the image
   */
  title?: string;

  /**
   * Optional callback when the image is clicked
   */
  onClick?: () => void;

  /**
   * Optional CSS class name to apply to the container
   */
  className?: string;

  /**
   * Whether to optimize the image to take maximum available space
   * @default true
   */
  optimizeSpace?: boolean;
};

/**
 * SpaceImage component that displays an image optimized for maximum space utilization
 * while maintaining aspect ratio on a clean black background
 */
export const SpaceImage: React.FC<SpaceImageProps> = ({ src, alt, title, onClick, className = "", optimizeSpace = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };

    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`${styles.container} ${optimizeSpace ? styles.optimizeSpace : ""} ${className}`} onClick={handleClick}>
      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <span>Image could not be loaded</span>
        </div>
      ) : (
        <div className={styles.imageWrapper}>
          <img src={src} alt={alt} className={styles.image} draggable={false} />
          {title && <div className={styles.title}>{title}</div>}
        </div>
      )}
    </div>
  );
};
