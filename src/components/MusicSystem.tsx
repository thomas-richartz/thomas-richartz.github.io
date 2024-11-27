import React, { useEffect, useRef } from "react";
import { GenerativeMusicSystem  } from "../audio/GenerativeMusicSystem";
import {SoundBlock} from "../audio/SoundBlock";

interface MusicSystemProps {
    play: boolean;
    blocks: SoundBlock[];
}

const MusicSystem: React.FC<MusicSystemProps> = ({ play, blocks }) => {
    const musicSystemRef = useRef<GenerativeMusicSystem | null>(null);

    useEffect(() => {
        if (!musicSystemRef.current) {
            musicSystemRef.current = new GenerativeMusicSystem(blocks);
        }

        if (play) {
            musicSystemRef.current.start();
        } else {
            musicSystemRef.current.stop();
        }
    }, [play, blocks]);

    return null;
};

export default MusicSystem;