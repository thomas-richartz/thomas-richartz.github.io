/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useGesture } from "@use-gesture/react";
import { useEffect, useRef, useState } from "react";
import { allImages, GalleryImage } from "../assets/assets";
import { buttonStyle, h2Style } from "../styles";

type GalleryCatScreenProps = {
    cat: string;
    onClick: (cat: string) => void;
};

export const GalleryCatScreen = ({ cat }: GalleryCatScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);
    const [showImage, setShowImage] = useState<GalleryImage | undefined>(undefined);

    const catRefs = useRef<HTMLImageElement[]>([]);

    // images sortBy category
    const sortedImagesByCat = allImages.sort((a, b) => (a.cat < b.cat ? -1 : 1));

    const images: GalleryImage[] = [];

    sortedImagesByCat.forEach(image => {
        console.log(image)
        if (cat === image.cat) {
            images.push(image);
        }
    });

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
    }, []);


    const doSomethingWith = (state:any) => {
        // state.wheeling === true ? next : prev 
        console && console.log(state);
    };

    const bind = useGesture({
        onScroll: (state) => doSomethingWith(state),
        onScrollStart: (state) => doSomethingWith(state),
        onScrollEnd: (state) => doSomethingWith(state),
        onWheel: (state) => doSomethingWith(state),
        onWheelStart: (state) => doSomethingWith(state),
        onWheelEnd: (state) => doSomethingWith(state),
    });


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
        return <article css={imageStyles} onClick={() => { setShowImage(image) }} >
            <h2 css={h2Style}>{image!.title}</h2>
            <img
                key={index}
                alt={image!.title}
                ref={el => {
                    console.log(el);
                    console.log("add index " + index);
                    if (el) catRefs.current.push(el);
                }}
                css={imageImgStyles} src={`assets/images/${image!.filename}`} />
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
        }} onClick={() => setShowImage(undefined)}>
            <button css={[buttonStyle, { opacity: 0 }]}> &lt; </button>
            <img
                {...bind()}
                key={showImage.filename}
                alt={showImage.title}
                style={{
                    height: "80vh",
                    maxWidth: "90vw",
                    objectFit: "cover",
                    border: "1px solid #fff",
                }} src={`assets/images/${showImage.filename}`} />
            <button css={[buttonStyle, { opacity: 0 }]}> &gt; </button>
        </div>}
    </div>;
}

