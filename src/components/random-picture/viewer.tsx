import React from "react";
import { GalleryImage } from "../../assets/assets";
import RandomPictureViewerItem from "./viewer-item";

interface IRandomPictureViewer {
  images: GalleryImage[];
}

export const RandomPictureViewer = ({ images }: IRandomPictureViewer): JSX.Element => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const randomImages: GalleryImage[] = React.useMemo(() => {
    const shuffledImages = [...images];
    for (let i = shuffledImages.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffledImages[i], shuffledImages[randomIndex]] = [shuffledImages[randomIndex], shuffledImages[i]];
    }
    return shuffledImages;
  }, [images]);

  const image = randomImages[currentImageIndex];

  return (
    <div style={{ marginTop: 20 }}>
      {randomImages.map((image, index) => (
        <RandomPictureViewerItem
          key={image.title + "-" + index}
          nextImage={nextImage}
          prevImage={prevImage}
          image={image}
        />
      ))}
    </div>
  );
};