

/** @jsxImportSource @emotion/react */

// import { css, keyframes } from "@emotion/react";
import { ReactElement, ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";

interface ITextFx {
    children: string[] | ReactElement | ReactElement[] | ReactNode;
    // mode: TextFxMode | undefined;
}


export const TextFx = ({ children, ...props }: ITextFx) => {
    const springStyle = useSpring(
            { opacity: 1, from: { opacity: 0 }, delay: 350 }
        );

    let text = String(children);

    return <>{text.split("").map((item: string, index: number) => {
        return <animated.span key={index} style={springStyle} {...props}>
            {item}
        </animated.span>
    })}</>;
}