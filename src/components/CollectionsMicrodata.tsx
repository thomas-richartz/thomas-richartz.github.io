import { useEffect, useMemo } from "react";
import { allImages } from "@/assets/assets";
import { slugify } from "@/utils/textUtils";

const generateCollectionsJsonLd = () => {
  const categories = [...new Set(allImages.map((image) => image.cat))];

  const collectionsJsonLd = categories.reduce((acc, cat) => {
    const imagesInCategory = allImages.filter((image) => image.cat === cat);

    acc.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: cat,
      url: `/collection/${slugify(cat)}`,
      itemListElement: imagesInCategory.map((image, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "ImageObject",
          name: image.title,
          contentUrl: `/assets/images/${image.filename}`,
          url: `/collection/${slugify(cat)}/${image.filename.replace(/\.webp$/, "")}`,
        },
      })),
    });

    return acc;
  }, [] as any[]);

  return collectionsJsonLd;
};

const CollectionsMicrodata = () => {
  const collectionsJsonLd = generateCollectionsJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(collectionsJsonLd),
      }}
    />
  );
};

export default CollectionsMicrodata;
