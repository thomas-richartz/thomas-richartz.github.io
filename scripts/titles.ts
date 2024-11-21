import { allImages } from "../src/assets/assets"; // Original assets
import * as fs from "fs";
import * as path from "path";

interface GalleryImage {
  filename: string;
  title: string;
  cat: string;
  range: number[];
}

const main = () => {
  // Load updated titles from assets.json
  const updatedAssetsPath = path.resolve(__dirname, "assets.json");
  const updatedAssets: GalleryImage[] = JSON.parse(
    fs.readFileSync(updatedAssetsPath, "utf-8"),
  );

  // Create a map of updated titles by filename for quick lookup
  const updatedTitleMap: Record<string, string> = updatedAssets.reduce(
    (acc, item) => {
      acc[item.filename] = item.title;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Update titles in allImages
  const updatedImages = allImages.map((image) => {
    if (updatedTitleMap[image.filename]) {
      return { ...image, title: updatedTitleMap[image.filename] };
    }
    return image;
  });

  // Log the updated data to stdout
  console.log(JSON.stringify(updatedImages, null, 2));
};

main();
