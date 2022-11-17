/** @jsxImportSource @emotion/react */
import { ReactNode, useMemo, useRef } from "react";
import { centeredImageStyle, gallerySliderWrapStyle, underHeadlineStyle } from "../styles";
import { allImages } from "../assets/assets";
import { LazyLoadImage } from "./LazyLoadImage";
import { GalleryImage } from "../types";
import { css } from "@emotion/react";

export const GallerySlider = (): JSX.Element => {

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

    // const randomImages:IParallaxLayer[] = [];
    const randomImages: ReactNode[] = [];

    let pages = 0;
    const images: GalleryImage[] = [];
    // iterate ranges and pick random pics
    for (let i = 0; i < 10; i++) {
        Object.keys(imagesByRange).map((key: keyof RangeKeyImages) => {
            let image = imagesByRange[key][Math.floor(Math.random() * imagesByRange[key].length)]
            images.push(image)
            return null;
        });
    }

    for (let image of images) {
        pages++;
        randomImages.push(<>
            <div style={{ background: "black", margin: "auto", width: "fit-content" }}>
                <h1 style={{ textAlign: "center", margin: "auto", }}>{image!.title}</h1>
                {/* <h2 css={underHeadlineStyle} ></h2> */}
            </div>
            <LazyLoadImage

                key={pages}
                alt={image!.title}
                cssStyle={imageImgStyles}
                src={`assets/images/${image!.filename}`} />
        </>
        );
    }

    return <><div css={gallerySliderWrapStyle}>
        <img css={[centeredImageStyle, imageProfile]} style={{ borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
        <h1 style={{ textAlign: "center" }}>Thomas Richartz</h1>
        <h2 css={underHeadlineStyle} style={{ textAlign: "center", margin: "auto", }}>{essayList[Math.floor(Math.random() * essayList.length)]}</h2>
    </div>
    {randomImages}
    </>
};

