/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { ReactElement } from "react";


type LazyLoadImageProps = {
    placeholder: ReactElement;
    alt:string;
    src:string;
    cssStyle:SerializedStyles;
}

export const LazyLoadImage = ({
    placeholder,
    alt,
    src,
    cssStyle
}:LazyLoadImageProps) => {
    return <img loading="lazy" alt={alt}  css={cssStyle} src={src} />
}
