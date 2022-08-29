/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "../hooks/useIntersectionObserver";


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

    const [isLoading, SetIsLoading] = useState<boolean>(true);
    const [currentSrc, SetCurrentSrc] = useState<string>("");

    const ref = useRef<HTMLDivElement|HTMLImageElement|null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting

    useEffect(() => {
        if (isVisible) {
            const image = new Image();
            // here we are not lazy anymore
            image.src = src;
            image.onload = () => {
                SetIsLoading(false);
                SetCurrentSrc(src)
            };
        }
    }, [src, isVisible])

    if (isLoading) {
        return <div ref={ref}><h1 style={{marginLeft:"22px"}}>Loading ...</h1></div>;
    }
    return <img loading="lazy" alt={alt} css={cssStyle} src={currentSrc} />
}
