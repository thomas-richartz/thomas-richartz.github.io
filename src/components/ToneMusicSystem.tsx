import React, { useEffect } from "react";
import { FileSoundBlock } from "@/audio/ToneMusicScene";
import { useToneMusic } from "@/context/ToneMusicContext";

interface Props {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  fadeDuration?: number; // seconds
}

const ToneMusicSystem: React.FC<Props> = ({ play, blocks, verbose, onLoadingChange, fadeDuration = 2 }) => {
  // Use the shared Tone Music context
  const { isLoading, setAudioBlocks, updateAllBlocks, isPlaying, togglePlay, setVerbose, getCurrentScene } = useToneMusic();

  // For tracking initialization state
  const isInitialized = React.useRef(false);

  // Update verbose setting
  useEffect(() => {
    if (verbose !== undefined) {
      setVerbose(verbose);
    }
  }, [verbose, setVerbose]);

  // Forward loading state to parent
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Synchronize blocks with context
  useEffect(() => {
    if (blocks.length > 0) {
      console.log("ToneMusicSystem: Updating blocks, count:", blocks.length);
      // If already playing, use updateAllBlocks to avoid restarting audio
      if (isPlaying) {
        updateAllBlocks(blocks);
      } else {
        setAudioBlocks(blocks);
      }
      isInitialized.current = true;
    }
  }, [blocks, isPlaying, setAudioBlocks, updateAllBlocks]);

  // Synchronize play state with context
  useEffect(() => {
    // Only attempt to toggle playback if we're initialized with blocks
    if (play !== isPlaying && isInitialized.current && blocks.length > 0) {
      console.log(`ToneMusicSystem: Play state changed from ${isPlaying} to ${play}`);

      // Add a small delay to ensure blocks are loaded
      const timer = setTimeout(() => {
        console.log("ToneMusicSystem: Toggling playback");
        togglePlay().catch((err) => {
          console.error("Error toggling playback:", err);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [play, isPlaying, togglePlay, blocks.length]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(`ToneMusicSystem: Playback state: ${isPlaying ? "PLAYING" : "STOPPED"}`);
  }, [isPlaying]);

  return (
    <div
      data-tonemusicscene="main"
      style={{ display: "none" }}
      data-playing={isPlaying ? "true" : "false"}
      data-blocks-count={blocks.length}
      data-scene-loaded={!!getCurrentScene()}
      data-initialized={isInitialized.current ? "true" : "false"}
    ></div>
  );
};

export default ToneMusicSystem;
