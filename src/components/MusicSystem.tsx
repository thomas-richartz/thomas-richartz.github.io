import React, { useEffect, useRef, useState } from "react";
import { WavStereoPlayer } from "../audio/WavStereoPlayer";
import { MusicScene } from "../audio/MusicScene";
import { FileSoundBlock } from "../audio/FileSoundBlock";

interface MusicSystemProps {
  play: boolean;
  blocks: FileSoundBlock[];
  sceneIndex: number;
  verbose: boolean;
}

const MusicSystem: React.FC<MusicSystemProps> = ({
  play,
  blocks,
  sceneIndex,
  verbose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const wavStereoPlayerRef = useRef<WavStereoPlayer | null>(null);
  const musicSceneRef = useRef<MusicScene | null>(null);

  useEffect(() => {
    if (!wavStereoPlayerRef.current) {
      const maxVoices = 4;
      wavStereoPlayerRef.current = new WavStereoPlayer(maxVoices, verbose);
    }

    const sceneReverb = true;
    const scene = new MusicScene(
      wavStereoPlayerRef.current!,
      blocks,
      sceneReverb,
      verbose,
    );
    musicSceneRef.current = scene;

    if (wavStereoPlayerRef.current.audioContext.state === "suspended") {
      wavStereoPlayerRef.current.audioContext.resume().then(() => {
        console.log("AudioContext resumed");
      });
    }
  }, [blocks, sceneIndex, verbose]);

  useEffect(() => {
    if (
      !wavStereoPlayerRef ||
      (wavStereoPlayerRef && !wavStereoPlayerRef.current)
    )
      return;
    if (!musicSceneRef || (musicSceneRef && !musicSceneRef.current)) return;

    const handlePlayStop = async () => {
      if (play && !isPlaying) {
        setIsPlaying(true);
        console.log(`Triggering play for block at index ${sceneIndex}`);
        await musicSceneRef!.current!.playBlock(sceneIndex); // Play the block at the current sceneIndex
      } else if (!play && isPlaying) {
        setIsPlaying(false);
        musicSceneRef!.current!.stop(); // Stop the music playback
      }
    };

    handlePlayStop();
  }, [play, sceneIndex, isPlaying]);

  return null;
};

export default MusicSystem;
