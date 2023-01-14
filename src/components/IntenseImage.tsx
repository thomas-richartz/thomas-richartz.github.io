/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";
import throttle from "lodash.throttle";
import React from "react";
import { useIntersectionObserver } from 'usehooks-ts'
import { lightBoxStyle, preloaderStyle } from "../styles";
import { LightBoxImage } from "./LightBoxImage";

const intenseImgStyles = css({
    maxHeight: '150vh',
    maxWidth: "150vw",
    // maxWidth: "100vw",
    objectFit: "cover",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    // "@media (min-width: 1028px)": {
    //     width: "240px",
    // }
});


interface IIntenseImage {
    // placeholder: ReactElement;
    nextImage: () => void,
    prevImage: () => void,
    alt: string;
    src: string;
    title: string;
    cssStyle: SerializedStyles;
}

export const IntenseImage = ({
    // placeholder,
    nextImage,
    prevImage,
    alt,
    src,
    title,
    cssStyle
}: IIntenseImage) => {

    // State
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [currentSrc, setCurrentSrc] = React.useState<string>("");
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    // lazy load
    const ref = React.useRef<HTMLDivElement | HTMLImageElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting

    const hasFullscreenSupport = document.fullscreenEnabled;


    const handleKeyUp = (e: KeyboardEvent) => {
        console.log("IntenseImage:handleKeyUp", e)
        if (e.key && e.key === "Escape") {
            document.exitFullscreen();
        }
        if (e.key && e.key === "ArrowRight") {
            nextImage()
        }
        if (e.key && e.key === "ArrowLeft") {
            prevImage()
        }
    }

    const throttledKeyUp = React.useMemo(() => throttle(handleKeyUp, 300), [])

    const makeFullScreen = (element: any) => {
        element.requestFullscreen();
    }

    const handleClick = (e: Event | React.MouseEvent<HTMLImageElement>) => {
        if (isOpen) {
            hideViewer()
        } else {
            showViewer(e)
        }
    };

    const showViewer = (e: Event | React.MouseEvent<HTMLImageElement>) => {
        if (e && e.currentTarget && hasFullscreenSupport) {
            makeFullScreen(e.currentTarget)
        }
        setIsOpen(true)
    };

    const hideViewer = () => {
        if (hasFullscreenSupport) {
            document.exitFullscreen()
        }
        setIsOpen(false)
    };

    React.useEffect(() => {
        // console.log("isLoading:", isLoading);
        // events
        try {
            window.addEventListener('keyup', throttledKeyUp);
        } catch (e: any) { console.log(e) }

        return () => {
            try {
                window.removeEventListener('keyup', throttledKeyUp);
            } catch (e: any) { console.log(e) }
        };
    }, [isLoading]);

    React.useEffect(() => {
        if (isVisible) {
            const image = new Image();
            // here we are not lazy anymore
            image.src = src;
            image.onload = () => {
                setIsLoading(false);
                setCurrentSrc(src)
            };
        }
    }, [src, isVisible])


    // React.useEffect(() => {
    //     console.log("useEffect isOpen:")
    //     console.log(isOpen)
    // }, [isOpen])

    if (isLoading) {
        return <div ref={ref}><h1 style={{ marginLeft: "22px" }}><div css={preloaderStyle}></div></h1></div>;
    }

    if (isOpen && !hasFullscreenSupport) {
        return <div css={lightBoxStyle} ><LightBoxImage
            onClick={handleClick}
            // nextImage={nextImage}
            // prevImage={prevImage}
            alt={title}
            // title={selectedImage!.title}
            cssStyle={intenseImgStyles}
            src={currentSrc} />
        </div>
    }
    return <img ref={imgRef} onClick={handleClick} loading="lazy" alt={alt} css={cssStyle} src={currentSrc} />

}
