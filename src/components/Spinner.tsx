/** @jsxImportSource @emotion/react */

// import { css, keyframes } from "@emotion/react";
import { MouseEventHandler } from "react";
import { useTransition, animated } from "@react-spring/web";
import { preloaderStyle } from "../styles";

type SpinnerProps = {
  onClick: MouseEventHandler<HTMLImageElement> | undefined;
}


export const Spinner = ({onClick}:SpinnerProps): JSX.Element => {

  const isVisible = true;

  const textTransitions = useTransition(isVisible, {
    from: { opacity: 0,  margin:"auto"},
    enter: { opacity: 1,  margin:"auto"},
    // leave: { opacity: 0 },
    delay: 300,
  });

  return textTransitions(
    (styles, item) => item && <animated.div style={styles} onClick={onClick}><div css={preloaderStyle}></div></animated.div>
  );

}