import React, { useEffect, useRef, useState } from "react";
import { WavStereoPlayer } from "@/audio/WavStereoPlayer";
import { MusicScene } from "@/audio/MusicScene";
import { FileSoundBlock } from "@/audio/FileSoundBlock";

interface MusicSystemProps {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose: boolean;
}

const MusicSystem: React.FC<MusicSystemProps> = ({ play, blocks, verbose }) => {
  const [blockIndex, setBlockIndex] = useState(0);
  const wavStereoPlayerRef = useRef<WavStereoPlayer | null>(null);
  const musicSceneRef = useRef<MusicScene | null>(null);

  // Initialize the audio player and MusicScene
  useEffect(() => {
    if (!wavStereoPlayerRef.current) {
      wavStereoPlayerRef.current = new WavStereoPlayer();
    }

    if (blocks.length > 0) {
      musicSceneRef.current = new MusicScene(
        wavStereoPlayerRef.current,
        blocks,
        true, // Enable reverb
      );
      // console.log("Initialized MusicScene:", musicSceneRef.current);
    }
  }, [blocks]);

  // Periodically advance the blockIndex
  useEffect(() => {
    if (!play || blocks.length === 0) return;

    const interval = setInterval(() => {
      setBlockIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % blocks.length;
        if (verbose) {
          console.log(
            `Advancing blockIndex to ${nextIndex} of ${blocks.length}`,
          );
        }
        return nextIndex;
      });
    }, 3000); // Every 2 minutes: 2 * 60 * 1000

    return () => clearInterval(interval); // Cleanup on unmount or play toggle
  }, [play, blocks, verbose]);

  // Play the current block when blockIndex changes
  useEffect(() => {
    if (!play || !musicSceneRef.current) return;

    musicSceneRef.current.playBlock(blockIndex);
  }, [blockIndex, play]);

  // Stop playback when play is toggled off
  useEffect(() => {
    if (!play && musicSceneRef.current) {
      musicSceneRef.current.stop();
    }
  }, [play]);

  return null; // MusicSystem doesn't render anything visible
};

export default MusicSystem;
