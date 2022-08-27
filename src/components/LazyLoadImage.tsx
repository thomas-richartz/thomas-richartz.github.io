/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { ReactElement, useEffect, useState } from "react";


type LazyLoadImageProps = {
    placeholder: ReactElement;
    alt: string;
    src: string;
    cssStyle: SerializedStyles;
}

export const LazyLoadImage = ({
    placeholder,
    alt,
    src,
    cssStyle
}: LazyLoadImageProps) => {

    const [isLoading, SetIsLoading] = useState<boolean>(true);
    const [currentSrc, SetCurrentSrc] = useState<string>("");

    useEffect(() => {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            SetIsLoading(false);
            SetCurrentSrc(src)
        };
        console.log(image)
    }, [src])

    if (isLoading) {
        return <><h1>Loading ...</h1></>;
        // return placeholder;
    }
    return <img loading="lazy" alt={alt} css={cssStyle} src={currentSrc} />
}
