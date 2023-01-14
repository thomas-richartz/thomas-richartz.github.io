/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";
import throttle from "lodash.throttle";
import React from "react";
// import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { useIntersectionObserver, useLockedBody, useScreen } from 'usehooks-ts'
import { preloaderStyle } from "../styles";

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


interface IPos2D {
    x: number;
    y: number;
}

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

    const [locked, setLocked] = useLockedBody(false, 'root');
    // https://usehooks-ts.com/react-hook/use-screen

    // chrome is a gui-term for browsers ui elements like address bar, tabs, etc.
    const screenWithoutChrome = useScreen();

    // State
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [currentSrc, setCurrentSrc] = React.useState<string>("");
    // intense
    const [currentPointerPos, setPointerPos] = React.useState<IPos2D>({ x: 0, y: 0 });
    const [overflow, setOverflow] = React.useState<IPos2D>({ x: 0, y: 0 });
    const [overflowValue, setOverflowValue] = React.useState<string>(document.body && document.body.style.overflow || "unset");
    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const intenseImgRef = React.useRef<HTMLImageElement | null>(null);
    // lazy load
    const ref = React.useRef<HTMLDivElement | HTMLImageElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting

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

    const handleClick = (e: Event|React.MouseEvent<HTMLImageElement>) => {
        if (isOpen) {
            document.exitFullscreen()
        } else {
            if (e && e.currentTarget)
            makeFullScreen(e.currentTarget)
        }
    };

    const handleTouchMove = () => { };
    const handleMouseMove = () => { };


    const showViewer = () => {
        setIsOpen(true)
        // setLocked(true)
    };

    const hideViewer = () => {
        // setLocked(false)
        setIsOpen(false)
    };

    React.useEffect(() => {
        // console.log("isLoading:", isLoading);
        // events
        try {
            window.addEventListener('keyup', throttledKeyUp);
        } catch (e: any) { console.log(e) }

        return () => {
            // setLocked(false)
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


    React.useEffect(() => {
        console.log("useEffect isOpen:")
        console.log(isOpen)
    }, [isOpen])

    if (isLoading) {
        return <div ref={ref}><h1 style={{ marginLeft: "22px" }}><div css={preloaderStyle}></div></h1></div>;
    }

    if (isOpen) {
        return <div style={{width:"100vw",height:"100vh",background:"#000"}}>
            <img ref={intenseImgRef} 
                onClick={handleClick}
                loading="lazy" alt={alt} css={intenseImgStyles} src={currentSrc} />
            <h1>{title}</h1>
        </div>
    }
    return <img ref={imgRef} onClick={handleClick} loading="lazy" alt={alt} css={cssStyle} src={currentSrc} />

}
