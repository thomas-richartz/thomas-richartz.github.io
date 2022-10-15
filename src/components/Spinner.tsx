/** @jsxImportSource @emotion/react */

import { css, keyframes } from "@emotion/react";
import { useTransition, animated } from "react-spring";

export const Spinner = (): JSX.Element => {

  const isVisible = true;

  const textTransitions = useTransition(isVisible, {
    from: { opacity: 0, transform: "translate3d(0,1000,0)", filter: "blur(0.6px)"},
    enter: { opacity: 1, transform: "translate3d(0,0,0)", filter: "blur(0px)"},
    leave: { opacity: 0 },
    delay: 800,
  });

  // color: '#fff', backgroundColor: "grey",
  // position: "relative",
  // overflow: "hidden",
  // width: "100%",
  // height: "100%",


  return textTransitions(
    (styles, item) => item && <animated.div style={styles}><h1 style={{ marginLeft: "22px" }}><div className="loader"></div><div className="loader"></div></h1></animated.div>
  );

}