import React from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { GalleryImage } from "../../assets/assets";

interface IRandomPictureViewerItem {
  nextImage: () => void;
  prevImage: () => void;
  image: GalleryImage;
}

const RandomPictureViewerItem = ({
  nextImage,
  prevImage,
  image,
}: IRandomPictureViewerItem) => {
  // State
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = React.useState<string>("");
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  // lazy load
  const ref = React.useRef<HTMLDivElement | HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

  const hasFullscreenSupport = React.useMemo(
    () => document.fullscreenEnabled,
    []
  );

  const handleKeyUp = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideViewer();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    },
    [nextImage, prevImage]
  );

  const makeFullScreen = (element: any) => {
    element.requestFullscreen();
  };

  const showViewer = React.useCallback(
    (e: Event | React.MouseEvent<HTMLImageElement>) => {
      if (e && e.currentTarget && hasFullscreenSupport) {
        makeFullScreen(e.currentTarget);
      }
      setIsOpen(true);
    },
    [hasFullscreenSupport]
  );

  const hideViewer = React.useCallback(() => {
    if (hasFullscreenSupport) {
      document.exitFullscreen();
    }
    setIsOpen(false);
  }, [hasFullscreenSupport]);

  const handleClick = React.useCallback(
    (e: Event | React.MouseEvent<HTMLImageElement>) => {
      if (isOpen) {
        hideViewer();
      } else {
        showViewer(e);
      }
    },
    [isOpen, showViewer]
  );
  React.useEffect(() => {
    // events
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  React.useEffect(() => {
    if (isVisible) {
      const image_ = new Image();
      image_.src = image.filename;
      image_.onload = () => {
        setIsLoading(false);
        setCurrentSrc(image.filename);
      };
    }
  }, [image, isVisible]);

  if (isLoading) {
    return (
      <div ref={ref}>
        <h1 style={{ marginLeft: "22px" }}>
          <div className="random-image--preload"></div>
        </h1>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      onClick={handleClick}
      loading="lazy"
      alt={image.title}
      src={currentSrc}
    />
  );
};

export default RandomPictureViewerItem;
