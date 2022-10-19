/** @jsxImportSource @emotion/react */

import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ReactNode, useMemo, useRef } from "react";
import { centeredImageStyle, gallerySliderWrapStyle, underHeadlineStyle } from "../styles";
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
        return null;
    });

    // console.log("imagesByRange");
    // console.log(imagesByRange);

    const essayList = [
        "Meine Hauptanstrengung galt immer dem Erlernen der handwerklichen Fähigkeiten zur Entwicklung meiner Kunst.",
        "Meine Bemühungen galten stets dem Entwickeln einer unzeitgenössischen Kunst.",
        "Mein Ideal blieb immer eine zeit-übergreifende Kunst.",
        "„Metakunst“ zum Wohle Aller!",
    ];

    const imageImgStyles = css({
        // width: '100%',
        maxHeight: "fit-content",
        objectFit: "cover",
        height: "100vh",

        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        // "@media (min-width: 1028px)": {
        //     width: "240px",
        // }

    });

    const imageProfile = css({
        webkitFilter: "grayscale(100%)",
        filter: "grayscale(100%)",
        // marginTop: "120px",
    })

    // const parallaxLayers:IParallaxLayer[] = [];
    const parallaxLayers: ReactNode[] = [];

    let pages = 0;
    // iterate ranges and pick random pics
    Object.keys(imagesByRange).map((key: keyof RangeKeyImages) => {

        pages++;
        // pick one random image each range
        let image = imagesByRange[key][Math.floor(Math.random() * imagesByRange[key].length)]

        // console.log("key:", key)
        parallaxLayers.push(<ParallaxLayer
            offset={pages}
            speed={0.4}
        >
            <div style={{ background: "black", margin: "auto", width: "fit-content"}}>
                <h1 style={{ textAlign: "center", margin: "auto", }}>{key}</h1>
                <h2 css={underHeadlineStyle} >{image!.title}</h2>
            </div>

        </ParallaxLayer>);


        parallaxLayers.push(<ParallaxLayer
            offset={pages + .2}
            speed={0.1}
        >

            <LazyLoadImage

                key={pages}
                alt={image!.title}
                cssStyle={imageImgStyles}
                src={`assets/images/${image!.filename}`} />

        </ParallaxLayer>);

        return null;
    });

    return <div css={gallerySliderWrapStyle}>

        <Parallax pages={pages + 1} ref={parallaxRef}>
            <ParallaxLayer
                offset={0}
                speed={0}
                factor={3}
                onClick={() => parallaxRef.current.scrollTo(1)}
            >
                <img css={[centeredImageStyle, imageProfile]} style={{ borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
            </ParallaxLayer>
            <ParallaxLayer
                offset={0.3}
                speed={1}
            >
                <h1 style={{ textAlign: "center" }}>Thomas Richartz</h1>
                <h2  css={underHeadlineStyle} style={{ textAlign: "center", margin: "auto", }}>{essayList[Math.floor(Math.random() * essayList.length)]}</h2>
            </ParallaxLayer>
            {parallaxLayers}
        </Parallax>
    </div>

};

