import React, { useEffect, useRef, useState } from "react";
import { ToneMusicScene, FileSoundBlock } from "@/audio/ToneMusicScene";

interface Props {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

const ToneMusicSystem: React.FC<Props> = ({ play, blocks, verbose, onLoadingChange }) => {
  const sceneRef = useRef<ToneMusicScene | null>(null);
  const [loading, setLoading] = useState(false);
  const blocksRef = useRef<FileSoundBlock[]>(blocks);

  // Reset scene when blocks change
  useEffect(() => {
    blocksRef.current = blocks;
    if (sceneRef.current) {
      sceneRef.current.stop();
      sceneRef.current = null;
    }
    setLoading(false);
    if (onLoadingChange) onLoadingChange(false);
  }, [blocks, onLoadingChange]);

  // Only load and play when play is true
  useEffect(() => {
    let cancelled = false;
    if (!play) {
      if (sceneRef.current) sceneRef.current.stop();
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      if (verbose) console.log("Scene stopped");
      return;
    }
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    // Create the scene on first play
    const scene = new ToneMusicScene(blocksRef.current);
    sceneRef.current = scene;
    // Load and start playback
    scene.scheduleQuantizedPlayback().then(() => {
      if (cancelled) return;
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      if (verbose) console.log("Scene started (polyrhythmic quantized)");
    });
    return () => {
      cancelled = true;
      scene.stop();
    };
  }, [play, verbose, onLoadingChange]);

  return null;
};

export default ToneMusicSystem;
