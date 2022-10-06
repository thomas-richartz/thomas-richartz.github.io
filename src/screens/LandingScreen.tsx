/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { landingWrapStyle } from "../styles";

type LandingScreenProps = {
    // cat: string;
    onCatClick: (cat:string) => void;
    onNavigate: (screen:string) => void;
};

export const LandingScreen = ({onCatClick, onNavigate}:LandingScreenProps): JSX.Element => {
    return <div css={landingWrapStyle} onClick={() => onNavigate("gallery")}>
        <h1>Thomas Richartz</h1>
        <img src="/assets/img/thomas-richartz.jpg" />
    </div>;
}

