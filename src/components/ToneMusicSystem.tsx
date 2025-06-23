import React, { useEffect, useRef, useState } from "react";
import { ToneMusicScene, FileSoundBlock } from "@/audio/ToneMusicScene";

interface Props {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose: boolean;
}

const ToneMusicSystem: React.FC<Props> = ({ play, blocks, verbose }) => {
  const [blockIndex, setBlockIndex] = useState(0);
  const sceneRef = useRef<ToneMusicScene | null>(null);

  useEffect(() => {
    sceneRef.current = new ToneMusicScene(blocks, true);
  }, [blocks]);

  useEffect(() => {
    if (!play) {
      sceneRef.current?.stop();
      return;
    }
    const interval = setInterval(() => {
      setBlockIndex((prev) => (prev + 1) % blocks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [play, blocks.length]);

  useEffect(() => {
    if (play) sceneRef.current?.playBlock(blockIndex);
  }, [blockIndex, play]);

  return null;
};

export default ToneMusicSystem;
