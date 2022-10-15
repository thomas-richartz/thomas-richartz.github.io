/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { useTransition, animated } from "react-spring";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { Spinner } from "./Spinner";


type LazyLoadImageProps = {
    // placeholder: ReactElement;
    alt: string;
    src: string;
    cssStyle: SerializedStyles;
}

export const LazyLoadImage = ({
    // placeholder,
    alt,
    src,
    cssStyle
}: LazyLoadImageProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentSrc, setCurrentSrc] = useState<string>("");

    const ref = useRef<HTMLDivElement | HTMLImageElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting

    const imgTransitions = useTransition(!isVisible, {
        from: { opacity: 0, },
        enter: { opacity: 1, },
        // leave: {opacity: 0},
        delay: 200,
    });

    
    useEffect(() => {
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

    
    if (isLoading) {
        // spinner needs ref?
        // return <Spinner />;
        return <div ref={ref}><h1 style={{marginLeft:"22px"}}><div className="loader"></div></h1></div>;
        // return <div ref={ref}><h1 style={{marginLeft:"22px"}}>Loading ...</h1></div>;
    }
    return imgTransitions(
        (styles, item) => item && <animated.img loading="lazy" alt={alt} style={styles} css={cssStyle} src={currentSrc} />
    );
}
