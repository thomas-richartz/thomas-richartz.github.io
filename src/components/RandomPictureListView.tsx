/** @jsxImportSource @emotion/react */
import React from "react";
import { allImages } from "../assets/assets";
import { GalleryImage } from "../types";
import { css } from "@emotion/react";
// import { LightBoxImage } from "./LightBoxImage";
import { IntenseImage } from "./IntenseImage";
import { LightBoxImage } from "./LightBoxImage";

interface IRandomPictureListView {
    images : GalleryImage[];
    selectedImage: GalleryImage | undefined;
}

export const RandomPictureListView = ({images, selectedImage}:IRandomPictureListView): JSX.Element => {

    // const [showImage, setShowImage] = React.useState<GalleryImage | undefined>(undefined);

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

    const randomImgStyles = css({
        maxHeight: '90vh',
        maxWidth: "90vw",
        objectFit: "cover",
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        // "@media (min-width: 1028px)": {
        //     width: "240px",
        // }
    });

    const nextImage = () => {
        console.log("nextImage")
    };
    
    const prevImage = () => {
        console.log("prevImage")
    };

    if (selectedImage !== undefined) {
        return <LightBoxImage
        onClick={()=>{}}
            // nextImage={nextImage}
            // prevImage={prevImage}
            alt={selectedImage!.title}
            // title={selectedImage!.title}
            cssStyle={randomImgStyles}  
            src={`assets/images/${selectedImage!.filename}`} />
            
    }

    const randomImages: React.ReactNode[] = [];
    
    let pages = 0;
    for (let image of images) {
        pages++;
        randomImages.push(<div style={{marginTop: 20}}>
            <IntenseImage
                nextImage={nextImage}
                prevImage={prevImage}
                key={image!.title + "-" + pages}
                alt={image!.title}
                title={image!.title}
                cssStyle={randomImgStyles}
                src={`assets/images/${image!.filename}`} />
        </div>
        );
    }

    return <>{randomImages}</>
};

