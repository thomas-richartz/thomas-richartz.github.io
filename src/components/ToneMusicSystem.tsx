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
  const blocksRef = useRef<FileSoundBlock[]>(blocks);

  // Fade out and stop old scene, then replace
  async function fadeOutAndStopOldScene(current: ToneMusicScene | null, fadeDuration: number) {
    if (current) {
      if (verbose) console.log("Fading out old scene");
      await current.fadeOut?.(fadeDuration);
      current.stop();
    }
  }

  // Handle scene switch (blocks change)
  useEffect(() => {
    let cancelled = false;
    blocksRef.current = blocks;

    const switchScene = async () => {
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);

      if (sceneRef.current) {
        await fadeOutAndStopOldScene(sceneRef.current, fadeDuration);
        sceneRef.current = null;
      }

      if (!play) {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        return;
      }

      const scene = new ToneMusicScene(blocksRef.current);
      sceneRef.current = scene;
      await scene.load();
      if (cancelled) return;
      await scene.fadeIn?.(fadeDuration);
      scene.scheduleQuantizedPlayback();
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
      if (verbose) console.log("Scene switched and faded in");
    };

    switchScene();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Handle play/pause transitions
  useEffect(() => {
    let cancelled = false;

    const handlePlayPause = async () => {
      if (!play) {
        if (sceneRef.current) {
          await sceneRef.current.fadeOut?.(fadeDuration);
          sceneRef.current.stop();
        }
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        if (verbose) console.log("Scene stopped and faded out");
        return;
      }
      // Already handled by the blocks effect if blocks change
    };

    handlePlayPause();

    return () => {
      cancelled = true;
    };
    // Only depend on play, not blocks (blocks handled above)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  return null;
};

export default ToneMusicSystem;
