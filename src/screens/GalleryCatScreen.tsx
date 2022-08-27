/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { allImages, GalleryImage } from "../assets/assets";
import { LazyLoadImage } from "../components/LazyLoadImage";
import { Spinner } from "../components/Spinner";
import { buttonStyle, catsH2Style } from "../styles";

type GalleryCatScreenProps = {
    cat: string;
    onClick: (cat: string) => void;
};

export const GalleryCatScreen = ({ cat }: GalleryCatScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<GalleryImage | undefined>(undefined);

    // images sortBy category
    const sortedImagesByCat = allImages.sort((a, b) => (a.cat < b.cat ? -1 : 1));

    const images: GalleryImage[] = [];

    sortedImagesByCat.forEach(image => {
        if (cat === image.cat) {
            images.push(image);
        }
    });

    const escKey = (event: any) => {
        if (event.key === "Escape") {
            setShowImage(undefined);
        }
    };

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
        document.addEventListener("keydown", escKey, false);
        return () => {
            document.removeEventListener("keydown", escKey);
        }
    }, []);


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
            if (image!.title !== showImage?.title) {
                prevImage = image;
                setShowImage(prevImage);
                hasDoneSoemthing = true;
                return;
            }
        });

    };

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

    return <div css={imageWrapperStyles}>{images.map((image, index) => {
        return  <article css={imageStyles} onClick={() => { setShowImage(image) }} >
            <h2 css={catsH2Style}>{image!.title}</h2>
            <LazyLoadImage
                placeholder={<Spinner />}
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
            <button css={[buttonStyle, { opacity: 1 }]} onClick={() => showPrevImage()}> &lt; </button>
            <img
                loading="lazy"
                key={showImage.filename}
                alt={showImage.title}
                css={{
                    height: "unset",
                    maxWidth: "59vw",
                    maxHeight: "59vh",
                    objectFit: "contain",
                    border: "1px solid #fff",
                    "@media (min-width: 1096x)": {
                        height: "80vh",
                    }
                }} src={`assets/images/${showImage.filename}`}
                onClick={() => setShowImage(undefined)}
            />
            <button css={[buttonStyle, { opacity: 1 }]} onClick={() => showNextImage()}> &gt; </button>
        </div>}
    </div>;
}

