/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { GallerySlider } from "../components/GallerySlider";
import { centeredImageStyle, landingWrapStyle, warehouseWrapStyle } from "../styles";

type LandingScreenProps = {
    // cat: string;
    onCatClick: (cat: string) => void;
    onNavigate: (screen: string) => void;
};

export const LandingScreen = ({ onCatClick, onNavigate }: LandingScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
    }, []);

    const fadeStyles = css({
        opacity: hide ? 0 : 1,
        transition: "opacity 800ms",
    });

    return <div css={[warehouseWrapStyle, fadeStyles, landingWrapStyle]} onClick={() => onNavigate("gallery")}>
        <img css={centeredImageStyle} style={{borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
        <h1 style={{textAlign:"center"}}>Thomas Richartz</h1>
        <GallerySlider />
    </div>;
}

