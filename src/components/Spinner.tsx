/** @jsxImportSource @emotion/react */

import { css, keyframes } from "@emotion/react";
import { useTransition, animated } from "react-spring";

export const Spinner = (): JSX.Element => {

  const isVisible = true;

  const textTransitions = useTransition(!isVisible, {
    from: { opacity: 0,  },
    enter: { opacity: 1,  },
    leave: { opacity: 0 },
    delay: 1000,
  });

  return textTransitions(
    (styles, item) => item && <animated.div style={styles}><h1 style={{ marginLeft: "22px" }}><div className="loader"></div></h1></animated.div>
  );

}