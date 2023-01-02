/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";
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
    alt: string;
    src: string;
    title: string;
    cssStyle: SerializedStyles;
}

export const IntenseImage = ({
    // placeholder,
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

    const setDimensons = (target: any) => {
        const { offsetHeight, offsetWidth } = target;

        setOverflow({ x: 0, y: 0 })
    }


    const handleKeyUp = (e: KeyboardEvent) => {
        // console.log("IntenseImage:handleKeyUp", e)
        if (e.key && e.key === "Escape") {
            // console.log("->IntenseImage:handleKeyUp ESC")
            hideViewer()
        }
    }

    const handleClick = (e: Event|React.MouseEvent<HTMLImageElement> ) => {
        // console.log("IntenseImage:handleClick", e)
        // console.log("handleClick Viewer:", isOpen)        
        if (isOpen) {
            hideViewer()
        } else {
            showViewer()
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
            window.addEventListener('keyup', handleKeyUp);
            // useScreen : window.addEventListener('resize', setDimensons);
            // take care of both image-refs 
            // if (imgRef.current) {
            //     imgRef.current.addEventListener('click', handleClick);
            //     imgRef.current.addEventListener('touchmove', handleTouchMove);
            //     imgRef.current.addEventListener('mousemove', handleMouseMove);
            // }
        } catch (e: any) { console.log(e) }

        return () => {
            setLocked(false)
            try {
                window.removeEventListener('keyup', handleKeyUp);
                // useScreen : window.removeEventListener('resize', handleClick);
                // if (imgRef.current) {
                //     imgRef.current.removeEventListener('click', handleClick);
                //     imgRef.current.removeEventListener('touchmove', handleTouchMove);
                //     imgRef.current.removeEventListener('mousemove', handleMouseMove);
                // }
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
        // return <Spinner />; needs fowarded ref for instersection observer?
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
