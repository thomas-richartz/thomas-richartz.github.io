/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { GallerySlider } from "../components/GallerySlider";
import { landingWrapStyle, warehouseWrapStyle } from "../styles";

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
    // onClick={() => onNavigate("gallery")}
    return <div css={[warehouseWrapStyle, fadeStyles, landingWrapStyle]} >
        <GallerySlider />
    </div>;
}

