import React, { useCallback, useState, useEffect, useRef } from "react";
import AudioBlockEditor from "./AudioBlockEditor/AudioBlockEditor";
import { useToneMusic } from "@/context/ToneMusicContext";
import styles from "./MusicEditor.module.css";
import * as Tone from "tone";

/**
 * MusicEditor component for the admin panel
 * Wraps the AudioBlockEditor component and handles audio playback
 */
export function MusicEditor() {
  const { isPlaying, togglePlay, fadeDuration = 1.5 } = useToneMusic();

  // State for visualization
  const [visualizationData, setVisualizationData] = useState<Uint8Array>(new Uint8Array(128).fill(10));

  // References for audio analysis
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Set up the audio analyzer when the component mounts
  useEffect(() => {
    // Create a new analyzer if none exists
    if (!analyserRef.current) {
      try {
        // Create FFT analyzer with 128 size
        analyserRef.current = new Tone.Analyser("fft", 128);
        // Connect the main output to our analyzer
        Tone.getDestination().connect(analyserRef.current);
        console.log("Analyzer created and connected to audio output");
      } catch (error) {
        console.error("Failed to create audio analyzer:", error);
      }
    }

    // Clean up function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (analyserRef.current) {
        try {
          // Proper cleanup for Tone.js objects
          if (analyserRef.current) {
            // Disconnect all inputs from the analyzer instead of trying to disconnect from destination
            analyserRef.current.dispose();
            analyserRef.current = null;
          }
        } catch (error) {
          console.error("Error cleaning up analyzer:", error);
        }
      }
    };
  }, []);

  // Update visualization data when playing
  useEffect(() => {
    const updateVisualization = () => {
      if (analyserRef.current && isPlaying) {
        try {
          // Get analysis data without arguments
          const data = analyserRef.current.getValue();
          // Convert to Uint8Array for visualization (0-255 range)
          const uint8Data = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) {
            // Convert from dB (-100 to 0) to 0-255
            uint8Data[i] = Math.max(0, Math.min(255, ((data[i] as number) + 100) * 2.55));
          }
          setVisualizationData(uint8Data);
        } catch (error) {
          console.error("Error updating visualization:", error);
        }

        // Continue the animation loop
        animationFrameRef.current = requestAnimationFrame(updateVisualization);
      } else if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        // Reset visualization to idle state
        setVisualizationData(new Uint8Array(128).fill(10));
      }
    };

    // Start or stop the visualization loop based on playing state
    if (isPlaying) {
      updateVisualization();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        setVisualizationData(new Uint8Array(128).fill(10));
      }
    }

    // Clean up on unmount or when isPlaying changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleChange = useCallback(
    (blocks: any, idx: any, param: any) => {
      if (param === "close" && isPlaying) {
        // Use fadeDuration to ensure smooth fade-out when closing
        togglePlay(fadeDuration).catch((err: any) => console.error("Error stopping playback:", err));
      }
    },
    [isPlaying, togglePlay, fadeDuration],
  );

  return (
    <div className={styles.container}>
      <AudioBlockEditor initialBlocks={[]} title="Audio Block Editor" onChange={handleChange} visualizationData={visualizationData} isPlaying={isPlaying} />
    </div>
  );
}
