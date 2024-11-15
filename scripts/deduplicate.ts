import * as fs from 'fs';
import { GalleryImage } from '../src/types'; 
import { allImages } from '../src/assets/assets';

// Slugify function
const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word characters
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single one

// Deduplication logic
const findDuplicates = (images: GalleryImage[]) => {
  const map = new Map<string, GalleryImage>();  // Key: slugified title, Value: original image
  const duplicates = new Set<GalleryImage>();   // Keep track of duplicates

  images.forEach((image) => {
    const slugifiedTitle = slugify(image.title);
    const imagePath = image.filename;  // full image path (including directory)

    // Check if the image title is **not** slugified
    if (image.title !== slugifiedTitle) {
      // Check if the slugified title already exists in the map and it comes from a different directory
      if (map.has(slugifiedTitle)) {
        const existingImage = map.get(slugifiedTitle)!;
        
        // If the file paths are different, keep both versions
        if (existingImage.filename !== imagePath) {
          map.set(slugifiedTitle, existingImage);  // Keep the one that already exists
        } else {
          duplicates.add(image);  // If both are from the same directory, mark as duplicate
        }
      } else {
        // If the slugified version doesn't exist, add it to the map
        map.set(slugifiedTitle, image);
      }
    } else {
      // If the title is already slugified
      if (!map.has(slugifiedTitle)) {
        map.set(slugifiedTitle, image);
      } else {
        const existingImage = map.get(slugifiedTitle)!;
        
        // If the paths are different (meaning different folders), keep both versions
        if (existingImage.filename !== imagePath) {
          map.set(slugifiedTitle, existingImage);  // Keep the original image
        } else {
          duplicates.add(image);  // If both are in the same directory, discard the duplicate
        }
      }
    }
  });

  return {
    duplicates: Array.from(duplicates),
    unique: Array.from(map.values()),
  };
};

// Analyze `allImages`
const { duplicates, unique } = findDuplicates(allImages);

// Save unique images back to a TypeScript file
const outputPath = './uniqueAssets.ts';
const outputContent = `import { GalleryImage } from '../types';

export const allImages: GalleryImage[] = ${JSON.stringify(unique, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent, 'utf-8');

// Log duplicates for reference
console.log('Duplicates found:', duplicates);
console.log(`Unique assets saved to ${outputPath}`);
