

/** @jsxImportSource @emotion/react */
// import { css, keyframes } from "@emotion/react";
import { animated, useTrail } from "@react-spring/web";
import React from "react";

interface ITextFx {
    children: React.ReactElement | React.ReactElement[] | React.ReactNode;
    // mode: TextFxMode | undefined;
};


export const TextFx = ({ children, ...props }: ITextFx) => {

    const [open, setOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setTimeout(() => { setOpen(true); }, 800)
    }, []);

    // React.Children.toArray ?
    let textItems = String(children).split("");

    const trail = useTrail(textItems.length, {
        config: { mass: 5, tension: 2000, friction: 200 },
        opacity: open ? 1 : 0,
        x: open ? 0 : 20,
        height: open ? 110 : 0,
        from: { opacity: 0, x: 20, height: 0 },
      })
    return <>{trail.map(({opacity, ...style}, index) => {
        return <animated.span key={index} style={style} {...props}>
            <animated.span style={{opacity}}>{textItems[index]}</animated.span>
        </animated.span>
    })}</>;
}