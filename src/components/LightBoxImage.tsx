/** @jsxImportSource @emotion/react */
import { SerializedStyles } from "@emotion/react";
import { MouseEventHandler, useEffect, useState } from "react";
import { useTransition, animated } from "react-spring";
import { Spinner } from "./Spinner";


type LightBoxImageProps = {
    // placeholder: ReactElement;
    alt: string;
    src: string;
    cssStyle: SerializedStyles;
    onClick: MouseEventHandler<HTMLImageElement> | undefined;
};

export const LightBoxImage = ({
    // placeholder,
    alt,
    src,
    cssStyle,
    onClick,
}: LightBoxImageProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentSrc, setCurrentSrc] = useState<string>("");


    const imgTransitions = useTransition(!isLoading, {
        from: { opacity: 0, },
        enter: { opacity: 1, },
        leave: {opacity: 0},
        delay: 200,
    });

    
    useEffect(() => {
            const image = new Image();
            // here we are not lazy anymore
            image.src = src;
            image.onload = () => {
                setIsLoading(false);
                setCurrentSrc(src)
            };
        
    }, [src])

    
    if (isLoading) {
        return <Spinner onClick={onClick} />;
    }
    return imgTransitions(
        (styles, item) => item && <animated.img loading="lazy" alt={alt} style={styles} css={cssStyle} src={currentSrc} onClick={onClick} />
    );
}
