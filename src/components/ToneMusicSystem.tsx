import React, { useEffect, useRef, useState } from "react";
import { ToneMusicScene, FileSoundBlock } from "@/audio/ToneMusicScene";

interface Props {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  fadeDuration?: number; // seconds
}

const ToneMusicSystem: React.FC<Props> = ({ play, blocks, verbose, onLoadingChange, fadeDuration = 2 }) => {
  const sceneRef = useRef<ToneMusicScene | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const switchScene = async () => {
      if (sceneRef.current) {
        if (verbose) console.log("Fading out old scene");
        await sceneRef.current.fadeOut?.(fadeDuration);
        sceneRef.current.stop();
        sceneRef.current = null;
      }

      // Only switch/create scene if playing and blocks present
      if (play && blocks.length > 0) {
        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);

        const scene = new ToneMusicScene(blocks);
        sceneRef.current = scene;
        await scene.load();
        if (cancelled) return;
        await scene.fadeIn?.(fadeDuration);
        scene.scheduleQuantizedPlayback();

        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        if (verbose) console.log("Scene switched and faded in");
      } else {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        if (verbose) console.log("Scene stopped (not playing or no blocks)");
      }
    };

    switchScene();

    return () => {
      cancelled = true;
      // Clean up scene on unmount
      if (sceneRef.current) {
        sceneRef.current.stop();
        sceneRef.current = null;
      }
    };
    // Depend on both play and blocks
  }, [play, blocks, fadeDuration, onLoadingChange, verbose]);

  return null;
};

export default ToneMusicSystem;
