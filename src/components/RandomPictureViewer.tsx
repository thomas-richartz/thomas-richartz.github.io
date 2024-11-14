import React from "react";
import { allImages } from "../assets/assets";
import { GalleryImage } from "../types";
import { RandomPictureListView } from "./RandomPictureListView";

export const RandomPictureViewer = (): JSX.Element => {

    const [showImage, setShowImage] = React.useState<GalleryImage | undefined>(undefined);

    type RangeKeyImages = {
        [key: string]: GalleryImage[]
    };

    const imagesByRange: RangeKeyImages = {};

    const sortedImagesByCatAndRange = React.useMemo(() => {
        const results: GalleryImage[] = allImages.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1));
        return results;
    }, []);

    sortedImagesByCatAndRange.map((image) => {
        let rangeKey = `${image.range[0]}-${image.range[1]}`
        if (!imagesByRange[rangeKey]) imagesByRange[rangeKey] = [];
        imagesByRange[rangeKey].push(image);
        return null;
    });

    // console.log("imagesByRange");
    // console.log(imagesByRange);

    const nextImage = () => {
        console.log("nextImage")
    };
    
    const prevImage = () => {
        console.log("prevImage")
    };

    const images: GalleryImage[] = [];
    // iterate ranges and pick random pics
    for (let i = 0; i < 10; i++) {
        Object.keys(imagesByRange).map((key: keyof RangeKeyImages) => {
            let image = imagesByRange[key][Math.floor(Math.random() * imagesByRange[key].length)]
            images.push(image)
            return null;
        });
    }
    
    return <>  
        <RandomPictureListView selectedImage={undefined}  images={images} />
    </>
};

