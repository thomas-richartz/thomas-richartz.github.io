/** @jsxImportSource @emotion/react */

import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useRef } from "react";
import { gallerySliderWrapStyle } from "../styles";
import { allImages } from "../assets/assets";

export const GallerySlider = (): JSX.Element => {

    const parallaxRef = useRef<IParallax>(null!)

    return <div css={gallerySliderWrapStyle}>
    
        <Parallax pages={3} ref={parallaxRef}>
            <ParallaxLayer >

                
            </ParallaxLayer>
        </Parallax>
    </div>

};

