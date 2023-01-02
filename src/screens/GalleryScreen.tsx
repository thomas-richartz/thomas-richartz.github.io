/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { allImages } from "../assets/assets";
import { Screen } from "../enums";
import { h2Style } from "../styles";
import { GalleryImage } from "../types";

type GalleryScreenProps = {
    // cat: string;
    onCatClick: (cat: string) => void;
    onNavigate: (screen: Screen) => void;
};

export const GalleryScreen = ({ onCatClick, onNavigate }: GalleryScreenProps): JSX.Element => {

    const [hide, setHide] = useState<boolean>(true);
    const catRefs = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        setTimeout(() => { setHide(false); }, 800)
    }, []);

    // images sortBy category and time in callback?

    // images sortBy category
    const sortedImagesByCat = useMemo(()=>{
        const results:GalleryImage[] = allImages.sort((a, b) => (a.cat < b.cat ? -1 : 1));
        return results;
    }, []);

    // const sortedImagesByCat = allImages.sort((a, b) => (a.cat < b.cat ? -1 : 1));
    // const sortedImagesByCatAndRange = sortedImagesByCat.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1))
    const sortedImagesByCatAndRange = useMemo(()=>{
        const results:GalleryImage[] = sortedImagesByCat.sort((a, b) => (a.range[0] > b.range[0] ? -1 : 1));
        return results;
    }, [sortedImagesByCat]);

    const catsListedSet = new Set();

    const images: GalleryImage[] = [];

    // TODO filter array
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
        return <article style={{ width: '100%', minHeight: '33vh', height: '33vh', overflow: 'none', backgroundColor: '#000', }} onClick={() => { setHide(true); setTimeout(() => { onCatClick(image!.cat); onNavigate(Screen.GALLERY_CAT); }, 800); }} >
            <h2 css={h2Style}>{image!.cat}</h2>
            <img
                key={index}
                alt={image!.title}
                ref={el => {
                    if (el) catRefs.current.push(el);
                }}
                style={{
                    width: '100%',
                    maxHeight: "fit-content",
                    objectFit: "cover",
                    height: "33vh",
                }} src={`assets/images/${image!.filename}`} />
        </article>
    })}
    </div>
}

