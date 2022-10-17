/** @jsxImportSource @emotion/react */

import { IParallax, IParallaxLayer, Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ReactNode, useMemo, useRef } from "react";
import { centeredImageStyle, gallerySliderWrapStyle } from "../styles";
import { allImages } from "../assets/assets";
import { LazyLoadImage } from "./LazyLoadImage";
import { GalleryImage } from "../types";
import { css } from "@emotion/react";

export const GallerySlider = (): JSX.Element => {

    const parallaxRef = useRef<IParallax>(null!)

    type RangeKeyImages = {
        [key: string]: GalleryImage[]
    };

    const imagesByRange: RangeKeyImages = {};

    const sortedImagesByCatAndRange = useMemo(() => {
        const results: GalleryImage[] = allImages.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1));
        return results;
    }, []);

    sortedImagesByCatAndRange.map((image) => {
        let rangeKey = `${image.range[0]}-${image.range[1]}`
        if (!imagesByRange[rangeKey]) imagesByRange[rangeKey] = [];
        imagesByRange[rangeKey].push(image);
    });

    // console.log("imagesByRange");
    // console.log(imagesByRange);

    const imageImgStyles = css({
        width: '100%',
        maxHeight: "fit-content",
        objectFit: "cover",
        height: "100vh",
    });

    // const parallaxLayers:IParallaxLayer[] = [];
    const parallaxLayers: ReactNode[] = [];

    let page = 1;
    // iterate ranges and pick random pics
    Object.keys(imagesByRange).map((key: keyof RangeKeyImages) => {
        page++;
        console.log("key:", key)
        parallaxLayers.push(<ParallaxLayer
            offset={page}
            speed={0.1}
            >
            <h1 style={{ textAlign: "left", marginLeft: "20px", }}>{key}</h1>
        </ParallaxLayer>);

        // pick one random image each range
        let image = imagesByRange[key][Math.floor(Math.random() * imagesByRange[key].length)]

        parallaxLayers.push(<ParallaxLayer
            offset={page + .2}
            speed={0.3}
        >
            <LazyLoadImage
                key={page}
                alt={image!.title}
                cssStyle={imageImgStyles}
                src={`assets/images/${image!.filename}`} />

        </ParallaxLayer>);

    });

    return <div css={gallerySliderWrapStyle}>

        <Parallax pages={5} ref={parallaxRef}>
            <ParallaxLayer
                offset={0}
                speed={0}
                factor={3}
                onClick={() => parallaxRef.current.scrollTo(1)}
            >
                <img css={centeredImageStyle} style={{ borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
            </ParallaxLayer>
            <ParallaxLayer
                offset={0.3}
                speed={1}
            >
                <h1 style={{ textAlign: "center" }}>Thomas Richartz</h1>
            </ParallaxLayer>
            {parallaxLayers}
        </Parallax>
    </div>

};

