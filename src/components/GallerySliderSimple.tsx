/** @jsxImportSource @emotion/react */
import React, { ReactNode, useMemo } from "react";
import { centeredImageStyle, gallerySliderWrapStyle, underHeadlineStyle } from "../styles";
import { allImages } from "../assets/assets";
import { LazyLoadImage } from "./LazyLoadImage";
import { GalleryImage } from "../types";
import { css } from "@emotion/react";
import { LightBoxImage } from "./LightBoxImage";

export const GallerySlider = (): JSX.Element => {

    const [showImage, setShowImage] = React.useState<GalleryImage | undefined>(undefined);


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

    const imageProfile = css({
        WebkitFilter: "grayscale(100%)",
        filter: "grayscale(100%)",
        // marginTop: "120px",
    })

    const onClickRandomImage = (img: GalleryImage) => {
        setShowImage(img)
    }

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
        randomImages.push(<div onClick={() => onClickRandomImage(image as GalleryImage)} style={{marginTop: 20}}>
            <LazyLoadImage
                key={image!.title + "-" + pages}
                alt={image!.title}
                cssStyle={randomImgStyles}
                src={`assets/images/${image!.filename}`} />
            <div style={{ background: "black", margin: "auto", width: "fit-content" }}>
                <h2 style={{ textAlign: "center", margin: "auto", }} css={underHeadlineStyle}>{image!.title}</h2>
            </div>
        </div>
        );
    }

    return <><div css={gallerySliderWrapStyle}>
        <img css={[centeredImageStyle, imageProfile]} style={{ borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
        <h1 style={{ textAlign: "center" }}>Thomas Richartz</h1>
        <h2 css={underHeadlineStyle} style={{ textAlign: "center", margin: "auto", }}>{essayList[Math.floor(Math.random() * essayList.length)]}</h2>
    </div>
        {randomImages}
        {showImage !== undefined && <div css={{
            zIndex: "1",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: 'rgba(0, 0, 0, 0.79)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }} >

            <LightBoxImage key={showImage.filename}
                alt={showImage.title}
                src={`assets/images/${showImage.filename}`}
                cssStyle={css({
                    height: "unset",
                    maxWidth: "79vw",
                    maxHeight: "79vh",
                    objectFit: "contain",
                    border: "1px solid #fff",
                    margin: "auto",
                    zIndex: 2,
                    "@media (min-width: 1096x)": {
                        height: "89vh",
                    }
                })
                }
                onClick={() => setShowImage(undefined)}
            />
        </div>}
    </>
};

