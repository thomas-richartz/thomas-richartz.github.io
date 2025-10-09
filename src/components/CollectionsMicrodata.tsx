import { useEffect, useMemo, useState } from "react";
import { slugify } from "@/utils/textUtils";
import type { GalleryImage } from "@/types";

// Type definitions for JSON-LD structure
interface ImageObject {
  "@type": "ImageObject";
  name: string;
  contentUrl: string;
  url: string;
}

interface ListItem {
  "@type": "ListItem";
  position: number;
  item: ImageObject;
}

interface CollectionJsonLd {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  url: string;
  itemListElement: ListItem[];
}

const generateCollectionsJsonLd = (allImages: GalleryImage[]): CollectionJsonLd[] => {
  try {
    // Get unique categories
    const categories = [...new Set(allImages.map((image) => image.cat))];

    if (!categories.length) {
      console.warn("No categories found in allImages");
      return [];
    }

    return categories.map((cat): CollectionJsonLd => {
      // Ensure category is valid
      if (typeof cat !== "string" || !cat) {
        throw new Error(`Invalid category: ${cat}`);
      }

      const imagesInCategory = allImages.filter((image) => image.cat === cat);

      if (!imagesInCategory.length) {
        console.warn(`No images found for category: ${cat}`);
      }

      // Create the collection JSON-LD
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: cat,
        url: `/collection/${slugify(cat)}`,
        itemListElement: imagesInCategory.map((image, index): ListItem => {
          if (!image.filename || !image.title) {
            throw new Error(`Invalid image data in category ${cat}: missing filename or title`);
          }

          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "ImageObject",
              name: image.title,
              contentUrl: `/assets/images/${image.filename}`,
              url: `/collection/${slugify(cat)}/${image.filename.replace(/\.webp$/, "")}`,
            },
          };
        }),
      };
    });
  } catch (error) {
    console.error("Error generating collections JSON-LD:", error);
    return [];
  }
};

const CollectionsMicrodata: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  // Load images dynamically
  useEffect(() => {
    const loadImages = async () => {
      try {
        const { allImages } = await import("@/assets/assets");
        setImages(allImages);
      } catch (error) {
        console.error("Error loading images:", error);
        setImages([]);
      }
    };
    loadImages();
  }, []);

  // Memoize the JSON-LD generation to avoid unnecessary recalculations
  const collectionsJsonLd = useMemo(() => {
    if (images.length === 0) return "";
    const data = generateCollectionsJsonLd(images);
    return JSON.stringify(data);
  }, [images]);

  if (!collectionsJsonLd) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: collectionsJsonLd,
      }}
    />
  );
};

export default CollectionsMicrodata;
