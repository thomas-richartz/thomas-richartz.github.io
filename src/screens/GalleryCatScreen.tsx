/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useMemo, useState } from "react";
import { allImages } from "../assets/assets";
import { LazyLoadImage } from "../components/LazyLoadImage";
import { LightBoxImage } from "../components/LightBoxImage";
import { buttonLeftStyle, buttonRightStyle, buttonStyle, catsH2Style } from "../styles";
import { GalleryImage } from "../types";

type GalleryCatScreenProps = {
    cat: string;
    onClick: (cat: string) => void;
};

export const GalleryCatScreen = ({ cat }: GalleryCatScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<GalleryImage | undefined>(undefined);

    // this ext dep doesnt triggers re-render
    const allImagesLocal = allImages;

    // images sortBy category 
    const sortedImagesByCat = useMemo(() => {
        const results: GalleryImage[] = allImagesLocal.sort((a, b) => (a.cat < b.cat ? -1 : 1));
        return results;
    }, [allImagesLocal]);

    const images: GalleryImage[] = [];

    sortedImagesByCat.forEach(image => {
        if (cat === image.cat) {
            images.push(image);
        }
    });

    const showNextImage = () => {
        let nextImage: GalleryImage;
        let takeNext: boolean = false;
        let hasDoneSoemthing: boolean = false;
        images.forEach((image) => {
            if (hasDoneSoemthing) return;
            if (takeNext) {
                nextImage = image;
                setShowImage(nextImage);
                hasDoneSoemthing = true;
                return;
            }
            if (image!.title === showImage?.title) {
                takeNext = true;
            }
        });
    };

    const showPrevImage = () => {
        // console && console.log(state);
        let prevImage: GalleryImage;
        let hasDoneSoemthing: boolean = false;
        images.forEach((image) => {
            if (hasDoneSoemthing) return;
            if (image!.title === showImage?.title) {
                setShowImage(prevImage);
                hasDoneSoemthing = true;
                return;
            } else {
                prevImage = image;
            }
        });

    };

    const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        console.log(event)
        if (event.code === "ArrowLeft") {
            // console.log("<");
            showPrevImage();
        }
        if (event.code === "ArrowRight") {
            // console.log(">");
            showNextImage();
        }
        // if (event.key === "Escape") {
        //     console.log("x");
        // }
        if (event.code === "Escape") {
            setShowImage(undefined);
        }
    };

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
    }, []);


    const imageWrapperStyles = css({
        display: 'flex',
        flexWrap: 'wrap',
        opacity: hide ? 0 : 1,
        transition: "opacity 800ms",
    })

    const imageStyles = css({
        width: '33.3333%',
        minHeight: '33vh',
        // height: '33vh',
        overflow: 'none',
        backgroundColor: '#000',
        // transitionDuration: '2s',
        // transitionProperty: 'height',
        // '&:hover':{
        //     height: '100vh'
        // }
    });

    const imageImgStyles = css({
        width: '100%',
        maxHeight: "fit-content",
        objectFit: "cover",
        height: "33vh",
    });

    return <div css={imageWrapperStyles} onKeyDown={keyDownHandler} tabIndex={0}>
        {images.map((image, index) => {
            return <article css={imageStyles} onClick={() => { setShowImage(image) }} >
                <h2 css={catsH2Style}>{image!.title}</h2>
                <LazyLoadImage
                    // run bin/preview to generate thumbs 
                    // placeholderSrc={`assets/images/${image!.filename}-s.webp`}
                    key={index}
                    alt={image!.title}
                    cssStyle={imageImgStyles}
                    src={`assets/images/${image!.filename}`}
                />
            </article>
        })}
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
            <button css={[buttonStyle, buttonLeftStyle, { opacity: 1 }]} onClick={() => showPrevImage()}> &#9664; </button>

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
            <button css={[buttonStyle, buttonRightStyle, { opacity: 1 }]} onClick={() => showNextImage()}> &#9654; </button>
        </div>}
    </div>;
}

