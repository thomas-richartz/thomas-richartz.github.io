/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { useTransition, animated, Spring } from "@react-spring/web";
// import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { useIntersectionObserver } from 'usehooks-ts'
import { preloaderStyle } from "../styles";
import { Spinner } from "./Spinner";


interface ILazyLoadImage {
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
}: ILazyLoadImage) => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentSrc, setCurrentSrc] = useState<string>("");

    const ref = useRef<HTMLDivElement | HTMLImageElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting

    const imgTransitions = useTransition(!isLoading, {
        from: { opacity: 0, },
        enter: { opacity: 1, },
        leave: { opacity: 0 },
        delay: 200,
    });

    const zoomTransition = useTransition(!isLoading, {
        from: { transform: "scale(0.79)", opacity: 0, },
        enter: { transform: "scale(1.0)", opacity: 1, },
        leave: { transform: "scale(1.2)", opacity: 0, },
        delay: 500,
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
        // spinner needs fowarded ref for instersection observer
        // return <Spinner />;
        return <div ref={ref}><h1 style={{ marginLeft: "22px" }}><div css={preloaderStyle}></div></h1></div>;
        // return <div ref={ref}><h1 style={{marginLeft:"22px"}}>Loading ...</h1></div>;
    }

    return zoomTransition(
        (styles, item) => item && <animated.img loading="lazy" alt={alt} style={styles} css={cssStyle} src={currentSrc} />
    );

}
