import React, { useEffect } from "react";
import { FileSoundBlock } from "@/audio/ToneMusicScene";
import { useToneMusic } from "@/context/ToneMusicContext";

interface Props {
  play: boolean;
  blocks: FileSoundBlock[];
  verbose?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  fadeDuration?: number; // seconds
  preservePlayback?: boolean; // Always true during scene transitions when audio is playing
}

const ToneMusicSystem: React.FC<Props> = ({ play, blocks, verbose, onLoadingChange, fadeDuration = 2, preservePlayback = true }) => {
  console.log("ToneMusicSystem: Component rendering with", blocks.length, "blocks, play:", play);
  // Use the shared Tone Music context
  const { isLoading, setAudioBlocks, updateAllBlocks, isPlaying, togglePlay, setVerbose, getCurrentScene, setFadeDuration } = useToneMusic();

  // For tracking initialization state
  const isInitialized = React.useRef(false);
  const initAttempts = React.useRef(0);
  const lastBlocksLength = React.useRef(0);

  // Update verbose setting
  useEffect(() => {
    if (verbose !== undefined) {
      setVerbose(verbose);
    }
    // Set fade duration from props
    if (fadeDuration !== undefined) {
      setFadeDuration(fadeDuration);
    }
  }, [verbose, setVerbose, fadeDuration, setFadeDuration]);

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

      // Track if blocks have changed
      const blocksChanged = lastBlocksLength.current !== blocks.length;
      lastBlocksLength.current = blocks.length;

      // If already playing, use updateAllBlocks to avoid restarting audio
      if (isPlaying) {
        console.log("ToneMusicSystem: Updating blocks while audio is playing");
        updateAllBlocks(blocks);
      } else {
        console.log("ToneMusicSystem: Setting blocks while audio is stopped");
        // Always use preservePlayback=true for consistent behavior during navigation
        // This ensures continuous audio between scenes without interruptions
        setAudioBlocks(blocks, true)
          .then(() => {
            console.log("ToneMusicSystem: Successfully set audio blocks");
            isInitialized.current = true;
          })
          .catch((err) => {
            console.error("ToneMusicSystem: Error setting audio blocks:", err);

            // Retry initialization if it fails (up to 3 times)
            if (initAttempts.current < 3) {
              initAttempts.current++;
              console.log(`ToneMusicSystem: Retrying block initialization (attempt ${initAttempts.current})`);

              // Retry with a delay
              setTimeout(() => {
                setAudioBlocks(blocks, true).catch((e) => console.error("ToneMusicSystem: Retry failed:", e));
              }, 500);
            }
          });

        setFadeDuration(fadeDuration);
      }

      // If blocks changed, reset retry counter
      if (blocksChanged) {
        initAttempts.current = 0;
      }

      isInitialized.current = true;
    }
  }, [blocks, isPlaying, setAudioBlocks, updateAllBlocks, fadeDuration]);

  // Synchronize play state with context
  useEffect(() => {
    // Only attempt to toggle playback if we're initialized with blocks
    if (play !== isPlaying && blocks.length > 0) {
      console.log(`ToneMusicSystem: Play state changed from ${isPlaying} to ${play}`);

      // Slightly longer delay to ensure blocks are properly loaded
      const timer = setTimeout(() => {
        // Double check blocks are still available before toggling
        if (blocks.length > 0) {
          console.log("ToneMusicSystem: Toggling playback with fade duration:", fadeDuration);

          // Force initialization if needed
          if (!isInitialized.current) {
            console.log("ToneMusicSystem: Forcing initialization before playback");
            setAudioBlocks(blocks, true)
              .then(() => {
                isInitialized.current = true;
                togglePlay(fadeDuration).catch((err) => {
                  console.error("Error toggling playback after init:", err);
                });
              })
              .catch((err) => {
                console.error("ToneMusicSystem: Error in forced initialization:", err);
              });
          } else {
            togglePlay(fadeDuration).catch((err) => {
              console.error("Error toggling playback:", err);

              // If toggle fails, try re-initializing blocks
              if (initAttempts.current < 3) {
                initAttempts.current++;
                console.log(`ToneMusicSystem: Re-initializing after playback failure (attempt ${initAttempts.current})`);

                setAudioBlocks(blocks, true)
                  .then(() => togglePlay(fadeDuration))
                  .catch((e) => console.error("Recovery attempt failed:", e));
              }
            });
          }
        } else {
          console.warn("ToneMusicSystem: Cannot toggle play - blocks no longer available");
        }
      }, 200); // Slightly longer delay for better reliability

      return () => clearTimeout(timer);
    }
  }, [play, isPlaying, togglePlay, blocks.length, fadeDuration, setAudioBlocks]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(`ToneMusicSystem: Playback state: ${isPlaying ? "PLAYING" : "STOPPED"}`);
    console.log(`ToneMusicSystem: preservePlayback: true (always preserved)`);
    console.log(`ToneMusicSystem: Using effective preservePlayback: true (always for consistent navigation)`);
  }, [isPlaying]);

  return (
    <div
      data-tonemusicscene="main"
      style={{ display: "none" }}
      data-playing={isPlaying ? "true" : "false"}
      data-blocks-count={blocks.length}
      data-scene-loaded={!!getCurrentScene()}
      data-initialized={isInitialized.current ? "true" : "false"}
      data-preserve-playback="true"
    ></div>
  );
};

export default ToneMusicSystem;
