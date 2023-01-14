/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { RandomPictureViewer } from "../components/RandomPictureViewer";
import { Screen } from "../enums";
import { landingWrapStyle, warehouseWrapStyle, centeredImageStyle, gallerySliderWrapStyle, underHeadlineStyle } from "../styles";
import { TextFx } from "../components/TextFx";

interface ILandingScreen {
    // cat: string;
    onCatClick: (cat: string) => void;
    onNavigate: (screen: Screen) => void;
};

export const LandingScreen = ({ onCatClick, onNavigate }: ILandingScreen): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
    }, []);

    const fadeStyles = css({
        opacity: hide ? 0 : 1,
        transition: "opacity 800ms",
    });

    const imageProfile = css({
        WebkitFilter: "grayscale(100%)",
        filter: "grayscale(100%)",
        // marginTop: "120px",
    })

    const essayList = [
        "Meine Hauptanstrengung galt immer dem Erlernen der handwerklichen Fähigkeiten zur Entwicklung meiner Kunst.",
        "Meine Bemühungen galten stets dem Entwickeln einer unzeitgenössischen Kunst.",
        "Mein Ideal blieb immer eine zeit-übergreifende Kunst.",
        "„Metakunst“ zum Wohle Aller!",
    ];

    return <div css={[warehouseWrapStyle, fadeStyles, landingWrapStyle]} >
        <div css={gallerySliderWrapStyle}>
            <img css={[centeredImageStyle, imageProfile]} style={{ borderRadius: "50%" }} src="/assets/img/thomas-richartz.jpg" alt={"thomas-richartz"} />
            <h1 style={{ textAlign: "center" }}>Thomas Richartz</h1>
            <h2 css={underHeadlineStyle} style={{ textAlign: "center", margin: "auto", }}><TextFx>{essayList[Math.floor(Math.random() * essayList.length)]}</TextFx></h2>
        </div>
        <RandomPictureViewer />
    </div>;
}

