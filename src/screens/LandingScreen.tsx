/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { allImages, GalleryImage } from "../assets/assets";

type GalleryScreenProps = {
    // cat: string;
    onCatClick: (cat:string) => void;
    onNavigate: (screen:string) => void;
};

export const LandingScreen = ({onCatClick, onNavigate}:GalleryScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);
    const catRefs = useRef<HTMLImageElement[]>([]);

    useEffect(()=>{
        setTimeout(()=> { setHide(false); }, 800)
    },[]);

    // images sortBy category and time
    const sortedImagesByCat = allImages.sort((a, b) => (a.cat < b.cat ? -1 : 1));
    const sortedImagesByCatAndRange = sortedImagesByCat.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1))

    const catsListedSet = new Set();

    const images: GalleryImage[] = [];

    sortedImagesByCatAndRange.forEach(image => {
        if (!catsListedSet.has(image.cat)) {
            catsListedSet.add(image.cat);
            images.push(image);
        }
    });

    const styles = css({
        display: 'flex', 
        flexWrap: 'wrap',
        opacity: hide ? 0 : 1,
        transition: "opacity 800ms",
    });

    return <div css={styles}>{images.map((image, index) => {
        return <article style={{ width: '33.3333%', minHeight: '33vh', height: '33vh', overflow: 'none', backgroundColor: '#000', }} onClick={() => { setHide(true); setTimeout(()=> { onCatClick(image!.cat); onNavigate("cat"); }, 800); }} >
            <h2 style={{
                color: 'rgba(255,255, 255,0.6)',
                textShadow: '4px 3px 0px #000, 9px 8px 0px rgba(255,255,255,0.15)',
                padding: '4px',
            }}>{image!.cat}</h2>
            <img
                key={index}
                alt={image!.title}
                ref={el => {
                    console.log(el);
                    console.log("add index " + index);
                    if (el) catRefs.current.push(el);
                }}
                style={{ width: '100%', height: 'auto' }} src={`assets/images/${image!.filename}`} />
        </article>
    })}
    </div>;
}

