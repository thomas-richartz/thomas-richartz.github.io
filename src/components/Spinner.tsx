/** @jsxImportSource @emotion/react */

import { css, keyframes } from "@emotion/react";

export const Spinner = (): JSX.Element => {

    const scanner = keyframes`
    0% {
      transform: translateX(-20%);
    }
  
    100% {
      transform: translateX(170%);
    }
`;

    return <div css={css({
        color: '#999', backgroundColor: "grey",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        "&:before": {
            content: " ",
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'linear-gradient( to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 8%, rgba(255, 255, 255, 0) 16%)',
            animation: scanner + " 0.9s linear infinite",
            zIndex: 1,
        }
    })}>Loading...</div>
}