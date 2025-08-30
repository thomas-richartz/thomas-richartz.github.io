import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import * as Tone from "tone";
import { FileSoundBlock, ToneMusicScene } from "@/audio/ToneMusicScene";
import { logAudioState, resetAudioContext } from "@/utils/AudioDebug";
// Ensure we have access to AudioContext types
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

// Define the context type
interface ToneMusicContextType {
  // State
  isPlaying: boolean;
  blocks: FileSoundBlock[];
  isLoading: boolean;
  verbose: boolean;
  visualizationData: Uint8Array;
  fadeDuration: number;

  // Actions
  togglePlay: (customFadeDuration?: number) => Promise<void>;
  setAudioBlocks: (blocks: FileSoundBlock[], preservePlayback?: boolean) => Promise<void>;
  updateBlock: (index: number, changes: Partial<FileSoundBlock>) => void;
  updateAllBlocks: (blocks: FileSoundBlock[]) => void;
  setFadeDuration: (duration: number) => void;
  loadBlocksFromFile: (url: string) => Promise<void>;
  setVerbose: (verbose: boolean) => void;

  // Scene access (for advanced operations)
  getCurrentScene: () => ToneMusicScene | null;

  // Debug utilities
  debugAudio: () => Promise<void>;
  resetAudio: () => Promise<void>;

  // Audio file/waveform handling
  waveforms: Map<string, { data: number[]; duration: number }>;
  generateWaveformData: (audioBuffer: AudioBuffer) => Promise<{ data: number[]; duration: number }>;
  processAudioFile: (file: File) => Promise<{
    blob: Blob;
    url: string;
    waveform: { data: number[]; duration: number };
  }>;
}

// Create the context with a default undefined value
const ToneMusicContext = createContext<ToneMusicContextType | undefined>(undefined);

// Waveform data interface
interface WaveformData {
  data: number[];
  duration: number;
}

// Provider props
interface ToneMusicProviderProps {
  children: React.ReactNode;
  initialBlocks?: FileSoundBlock[];
  initialPlay?: boolean;
  initialVerbose?: boolean;
  initialFadeDuration?: number;
}

export const ToneMusicProvider: React.FC<ToneMusicProviderProps> = ({
  children,
  initialBlocks = [],
  initialPlay = false,
  initialVerbose = false,
  initialFadeDuration = 2,
}) => {
  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlay);
  const [blocks, setBlocks] = useState<FileSoundBlock[]>(initialBlocks);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verbose, setVerbose] = useState<boolean>(initialVerbose);
  const [fadeDuration, setFadeDuration] = useState<number>(initialFadeDuration || 2);
  const [visualizationData, setVisualizationData] = useState<Uint8Array>(new Uint8Array(128).fill(0));
  const [waveforms, setWaveforms] = useState<Map<string, WaveformData>>(new Map());

  // Refs
  const sceneRef = useRef<ToneMusicScene | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Initialize Tone.js and analyser for visualizations
  useEffect(() => {
    // Prevent multiple initializations in development mode (React StrictMode)
    if (isInitializedRef.current) {
      console.log("ToneMusicContext: Already initialized, skipping redundant initialization");
      return;
    }

    // Make sure Transport is in a clean state at component mount
    Tone.Transport.cancel();

    const initTone = async () => {
      try {
        console.log("ToneMusicContext: Initializing audio system");
        isInitializedRef.current = true;

        // Force create a clean Tone context
        if (Tone.context.state !== "running") {
          // Don't await here - it needs user interaction which may not happen yet
          Tone.start().catch((err) => console.log("ToneMusicContext: Tone.js awaiting user interaction"));
        }

        if (!analyserRef.current) {
          analyserRef.current = new Tone.Analyser("fft", 128);
          Tone.Destination.connect(analyserRef.current);
          console.log("ToneMusicContext: Analyzer initialized successfully");
        }
      } catch (error) {
        console.error("ToneMusicContext: Failed to initialize audio analyzer:", error);
        isInitializedRef.current = false; // Allow retry on failure
      }
    };

    initTone();

    return () => {
      // In development mode with React StrictMode, this cleanup may run multiple times
      // We'll only clean up if we're truly unmounting the app
      console.log("ToneMusicContext: Cleanup function called");

      // Always clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Only clean up analyzer if we're truly unmounting
      if (analyserRef.current) {
        try {
          analyserRef.current.dispose();
          analyserRef.current = null;
        } catch (error) {
          console.warn("Error disposing analyzer:", error);
        }
      }

      // We'll keep Tone.js resources alive to prevent issues with multiple initializations
      // Real cleanup will happen when the app is closed or refreshed

      // We're intentionally disabling scene cleanup in the cleanup function
      // to prevent issues with React StrictMode's double mount/unmount
      // Real cleanup will happen when the app is closed
      // This commented code is kept for reference purposes only
      /*
      if (sceneRef.current) {
        try {
          sceneRef.current.stop();
          sceneRef.current.dispose();
          sceneRef.current = null;
        } catch (error) {
          console.warn("Error disposing scene:", error);
        }
      }
      */

      // Always make sure Transport is stopped and events are cleared
      try {
        Tone.Transport.cancel();
        Tone.Transport.stop();
      } catch (error) {
        console.warn("Error stopping Tone.js Transport:", error);
      }
    };
  }, []);

  // Animation loop for audio visualization
  const updateVisualization = useCallback(() => {
    if (analyserRef.current && isPlaying) {
      try {
        const data = analyserRef.current.getValue() as Float32Array;
        // Convert to Uint8Array for visualization (0-255 range)
        const uint8Data = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          // Convert from dB (-100 to 0) to 0-255
          uint8Data[i] = Math.max(0, Math.min(255, ((data[i] as number) + 100) * 2.55));
        }
        setVisualizationData(uint8Data);
      } catch (error) {
        // Silent error handling for visualization
        if (verbose) console.warn("Visualization error:", error);
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  }, [isPlaying, verbose]);

  // Start/stop visualization loop based on playback state
  useEffect(() => {
    if (isPlaying) {
      updateVisualization();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      // Reset visualization to idle state
      setVisualizationData(new Uint8Array(128).fill(10));
    }
  }, [isPlaying, updateVisualization]);

  // Generate waveform data from an audio buffer
  const generateWaveformData = useCallback(async (audioBuffer: AudioBuffer): Promise<WaveformData> => {
    // Create a lower resolution representation of the waveform (128 points)
    const numberOfSamples = 128;
    const data: number[] = new Array(numberOfSamples).fill(0);

    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const blockSize = Math.floor(channelData.length / numberOfSamples);

    for (let i = 0; i < numberOfSamples; i++) {
      let sum = 0;
      const offset = Math.floor(i * blockSize);

      // Get average amplitude in this block
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[offset + j] || 0);
      }

      data[i] = sum / blockSize;
    }

    // Normalize the data to 0-1 range
    const max = Math.max(...data);
    if (max > 0) {
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] / max;
      }
    }

    return { data, duration: audioBuffer.duration };
  }, []);

  // Process an uploaded audio file
  const processAudioFile = useCallback(
    async (file: File): Promise<{ blob: Blob; url: string; waveform: WaveformData }> => {
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);

      try {
        // Create AudioContext if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Load and decode the audio data
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        const waveform = await generateWaveformData(audioBuffer);

        return { blob, url, waveform };
      } catch (error) {
        console.error("Error processing audio file:", error);
        // Return a minimal waveform to avoid breaking the UI
        return {
          blob,
          url,
          waveform: { data: new Array(128).fill(0.5), duration: 1 },
        };
      }
    },
    [generateWaveformData],
  );

  // Load waveforms for blocks
  useEffect(() => {
    const loadWaveforms = async () => {
      for (const block of blocks) {
        if (block.filePath && !waveforms.has(block.filePath)) {
          try {
            setIsLoading(true);
            const response = await fetch(block.filePath);
            const blob = await response.blob();

            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const waveformData = await generateWaveformData(audioBuffer);

            setWaveforms((prev) => new Map(prev).set(block.filePath!, waveformData));
          } catch (error) {
            if (verbose) console.error(`Error loading waveform for ${block.filePath}:`, error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    loadWaveforms();
  }, [blocks, generateWaveformData, waveforms, verbose]);

  // Toggle play/pause
  const togglePlay = useCallback(
    async (customFadeDuration?: number) => {
      const fadeTime = customFadeDuration !== undefined ? customFadeDuration : fadeDuration || 2;
      // Create a timeout promise to prevent hanging operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), 5000);
      });

      try {
        console.log("ToneMusicContext: Toggle play called. Current state:", isPlaying);
        console.log("ToneMusicContext: Blocks available:", blocks.length);

        // Ensure audio context is running
        if (Tone.context.state !== "running") {
          console.log("ToneMusicContext: Starting Tone.js audio context");
          await Promise.race([Tone.start(), timeoutPromise]).catch((err) => {
            console.warn("ToneMusicContext: Tone.start() timed out or failed:", err);
            // Continue anyway, as user interaction may resolve this later
          });
        }

        if (isPlaying) {
          // Stop playback with careful null handling
          if (sceneRef.current) {
            if (verbose) console.log(`ToneMusicContext: Stopping playback and fading out with duration ${fadeTime}s`);
            try {
              // Store reference locally to prevent null issues during async operations
              const currentScene = sceneRef.current;

              console.log(`ToneMusicContext: Fading out with duration: ${fadeTime}s`);
              // Safely call fadeOut if it exists
              if (typeof currentScene.fadeOut === "function") {
                await Promise.race([currentScene.fadeOut(fadeTime), timeoutPromise]).catch((err) => {
                  console.warn("ToneMusicContext: Fade out timed out or failed:", err);
                  // Continue with stop even if fadeOut fails
                });
              }

              // Check reference again after async operation
              if (currentScene && typeof currentScene.stop === "function") {
                try {
                  currentScene.stop();
                } catch (stopError) {
                  console.warn("ToneMusicContext: Error stopping scene:", stopError);
                }
              }

              // Clean up Tone.js - this is independent of scene object
              Tone.Transport.cancel();
              Tone.Transport.stop();
            } catch (error) {
              console.warn("ToneMusicContext: Error during fadeout:", error);
              // Still proceed with transport cleanup on error
              try {
                Tone.Transport.cancel();
                Tone.Transport.stop();
              } catch (transportError) {
                console.error("ToneMusicContext: Transport cleanup error:", transportError);
              }
            }
          }
          setIsPlaying(false);
        } else {
          // Start playback
          if (verbose) console.log("ToneMusicContext: Starting playback with", blocks.length, "blocks");
          console.log("ToneMusicContext: Audio context state:", Tone.context.state);

          if (blocks.length > 0) {
            // Set state first to avoid race conditions
            setIsPlaying(true);

            try {
              // Initialize and start Tone.js if needed
              if (Tone.context.state !== "running") {
                await Tone.start();
                console.log("ToneMusicContext: Tone.js started successfully");
                await new Promise((resolve) => setTimeout(resolve, 300)); // Longer delay to ensure Tone.js is ready
              }

              // Force create a new scene (not reusing existing one to avoid issues)
              if (sceneRef.current) {
                try {
                  sceneRef.current.stop();
                  sceneRef.current.dispose();
                } catch (error) {
                  console.warn("ToneMusicContext: Error cleaning up previous scene:", error);
                }
                sceneRef.current = null;
              }

              // Create the new scene explicitly
              console.log("ToneMusicContext: Creating new ToneMusicScene with", blocks.length, "blocks");
              const newScene = new ToneMusicScene(blocks, true, true);
              console.log("ToneMusicContext: Loading audio files...");
              await newScene.load();
              console.log("ToneMusicContext: Audio files loaded successfully");

              // Another safety check before starting playback
              if (blocks.length === 0) {
                console.warn("ToneMusicContext: Blocks disappeared after loading - aborting playback");
                return;
              }

              sceneRef.current = newScene;

              // Actual playback with retry
              console.log("ToneMusicContext: Starting quantized playback...");
              try {
                await newScene.scheduleQuantizedPlayback();
                console.log("ToneMusicContext: Playback started successfully");
              } catch (error) {
                console.error("ToneMusicContext: Error in quantized playback, retrying...", error);
                // Retry once after a short delay
                await new Promise((resolve) => setTimeout(resolve, 300));
                await newScene.scheduleQuantizedPlayback();
              }

              // Verify Tone.js is actually playing
              // Check Transport state safely
              console.log("ToneMusicContext: Transport state:", Tone.Transport.state || "unknown");
              console.log("ToneMusicContext: Audio context state:", Tone.context.state);
            } catch (error) {
              console.error("ToneMusicContext: Error starting playback:", error);
              setIsPlaying(false);
            }
          } else {
            if (verbose) console.warn("ToneMusicContext: No blocks available to play");
          }
        }
      } catch (error) {
        console.error("ToneMusicContext: Error in togglePlay:", error);
        setIsPlaying(false);
      }
    },
    [isPlaying, blocks, verbose, fadeDuration],
  );

  // Update a single block's properties
  const updateBlock = useCallback(
    (index: number, changes: Partial<FileSoundBlock>) => {
      if (index < 0 || index >= blocks.length) {
        if (verbose) console.warn(`ToneMusicContext: Invalid block index: ${index}`);
        return;
      }

      const updatedBlocks = blocks.map((block, i) => (i === index ? { ...block, ...changes } : block));

      setBlocks(updatedBlocks);

      // Update the current scene if it's playing
      if (isPlaying && sceneRef.current) {
        const block = updatedBlocks[index];
        Object.keys(changes).forEach((key) => {
          sceneRef.current?.setBlockParam(block.name, key as keyof FileSoundBlock, (changes as any)[key]);
        });
      }
    },
    [blocks, isPlaying, verbose],
  );

  // Set all blocks at once, with fadeOutDuration parameter
  const setAudioBlocks = useCallback(
    async (newBlocks: FileSoundBlock[], preservePlayback?: boolean) => {
      if (!newBlocks || newBlocks.length === 0) {
        console.warn("ToneMusicContext: Empty blocks array provided to setAudioBlocks");
        return;
      }

      // Create a timeout promise to prevent hanging operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), 5000);
      });

      // Store blocks in a local variable to prevent race conditions
      const blocksToUse = [...newBlocks]; // Create a copy to avoid reference issues

      // Determine fade duration - use default value of 1 if not specified elsewhere
      const fadeOutDuration = fadeDuration || 1;
      // Modify preservation logic to respect the preservePlayback flag regardless of current playback state
      // This ensures we can have smooth transitions even when isPlaying might temporarily be false
      const shouldPreservePlayback = preservePlayback === true;

      // Store current playing state to use throughout this function
      const wasPlaying = isPlaying || shouldPreservePlayback;

      console.log(`ToneMusicContext: shouldPreservePlayback=${shouldPreservePlayback}, preservePlayback param=${preservePlayback}, isPlaying=${wasPlaying}`);

      console.log(`ToneMusicContext: Setting ${blocksToUse.length} audio blocks (preservePlayback: ${shouldPreservePlayback}, isPlaying: ${wasPlaying})`);

      // Set blocks first to ensure they're available for scene creation
      setBlocks(blocksToUse);

      // If shouldPreservePlayback is true, we want to transition smoothly to the new scene
      // If false, we want to fully stop the current scene before starting the new one
      if (shouldPreservePlayback) {
        try {
          if (verbose) console.log("ToneMusicContext: Preserving playback during scene transition");

          // Make sure Tone.js is running
          if (Tone.context.state !== "running") {
            await Promise.race([Tone.start(), timeoutPromise]).catch((err) => {
              console.warn("ToneMusicContext: Tone.start() timed out or failed:", err);
              // Continue anyway, as user interaction may resolve this
            });
            console.log("ToneMusicContext: Started Tone.js context");
          }

          // Handle fadeout of current scene if it exists
          if (sceneRef.current) {
            try {
              const currentScene = sceneRef.current;

              // Fade out current scene
              if (typeof currentScene.fadeOut === "function") {
                await Promise.race([currentScene.fadeOut(fadeOutDuration), timeoutPromise]).catch((err) => {
                  console.warn("ToneMusicContext: Fade out timed out or failed:", err);
                  // Continue with stop even if fadeOut fails
                });
              }

              // Stop and dispose after fadeout
              try {
                currentScene.stop();
                currentScene.dispose();
              } catch (stopError) {
                console.warn("ToneMusicContext: Error stopping/disposing scene:", stopError);
              }

              // Clear reference
              if (sceneRef.current === currentScene) {
                sceneRef.current = null;
              }
            } catch (error) {
              console.warn("ToneMusicContext: Error during scene fadeout:", error);
            }
          }

          // Final check before creating new scene
          if (blocksToUse.length === 0) {
            console.warn("ToneMusicContext: No blocks available for new scene - aborting transition");
            return;
          }

          // Create new scene with our safely copied blocks
          const newScene = new ToneMusicScene(blocksToUse, true, true);
          await newScene.load();
          sceneRef.current = newScene;

          // Start playback immediately if we were already playing OR if preservePlayback is true
          if (wasPlaying || shouldPreservePlayback) {
            await newScene.scheduleQuantizedPlayback();
            setIsPlaying(true); // Ensure we're in playing state
            console.log("ToneMusicContext: New scene started with continuous playback");
          }
        } catch (error) {
          console.error("ToneMusicContext: Error during playback-preserving transition:", error);
        }
      } else {
        // We're either explicitly not preserving playback, or we weren't playing to begin with

        // First fully stop the current scene if it exists
        if (sceneRef.current) {
          try {
            // Complete fadeout before stopping
            if (typeof sceneRef.current.fadeOut === "function") {
              await sceneRef.current.fadeOut(fadeOutDuration);
            }

            // Stop and dispose
            sceneRef.current.stop();
            sceneRef.current.dispose();
            sceneRef.current = null;

            // Ensure we're in stopped state
            setIsPlaying(false);

            // No delay needed - we want immediate transition between scenes
            // This prevents the "gap" between audio scenes
          } catch (error) {
            console.warn("ToneMusicContext: Error stopping current scene:", error);
            sceneRef.current = null;
          }
        }

        // Create new scene only after old one is completely stopped
        try {
          // Make sure we still have blocks to play
          if (blocksToUse.length === 0) {
            console.warn("ToneMusicContext: No blocks available for new scene after clean stop - aborting");
            return;
          }

          console.log("ToneMusicContext: Creating new scene after clean stop");
          const newScene = new ToneMusicScene(blocksToUse, true, true);
          await newScene.load();
          sceneRef.current = newScene;

          // Start playback if we should preserve playback or were already playing
          if (shouldPreservePlayback || wasPlaying) {
            await newScene.scheduleQuantizedPlayback();
            setIsPlaying(true);
            console.log("ToneMusicContext: Started playback of new scene after clean stop");
          }
        } catch (error) {
          console.error("ToneMusicContext: Error creating new scene:", error);
        }
      }

      // Return promise for proper chaining
      return Promise.resolve();
    },
    [verbose, fadeDuration, setIsPlaying, setBlocks, isPlaying],
  );

  // Update all blocks (without transition if already playing)
  const updateAllBlocks = useCallback(
    (newBlocks: FileSoundBlock[]) => {
      setBlocks(newBlocks);

      // If playing, update parameters on existing scene without transition
      if (isPlaying && sceneRef.current) {
        newBlocks.forEach((block) => {
          const params: (keyof FileSoundBlock)[] = ["volume", "pan", "playbackRate", "loop", "loopStart", "loopEnd"];
          params.forEach((param) => {
            if (block[param] !== undefined) {
              sceneRef.current?.setBlockParam(block.name, param, (block as any)[param]);
            }
          });
        });
      }
    },
    [isPlaying],
  );

  // Load blocks from a JSON file, with fadeOutDuration parameter
  const loadBlocksFromFile = useCallback(
    async (url: string, fadeOutDuration: number = 1) => {
      try {
        if (verbose) console.log(`ToneMusicContext: Loading sound blocks from ${url}`);
        setIsLoading(true);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load sound blocks: ${response.statusText}`);
        }

        const data = await response.json();
        if (verbose) console.log(`ToneMusicContext: Loaded ${data.length} sound blocks`);

        // Stop any current playback
        if (isPlaying && sceneRef.current) {
          try {
            await sceneRef.current.fadeOut?.(fadeOutDuration);
            sceneRef.current.stop();
            sceneRef.current = null;
          } catch (error) {
            console.warn("Error stopping current scene:", error);
          }

          // Set playing to false
          setIsPlaying(false);
        }

        // Update blocks
        setBlocks(data);

        // If we were playing before, restart with new blocks
        if (isPlaying) {
          // Delay to ensure UI updates first
          setTimeout(async () => {
            try {
              await togglePlay();
            } catch (error) {
              console.error("Error restarting playback:", error);
            }
          }, 200);
        }

        return data;
      } catch (error) {
        console.error("ToneMusicContext: Error loading sound blocks:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isPlaying, verbose, togglePlay],
  );

  // Get the current scene (for advanced operations)
  const getCurrentScene = useCallback(() => {
    return sceneRef.current;
  }, []);

  // Debug utilities
  const debugAudio = useCallback(async () => {
    console.log("ToneMusicContext: Running audio diagnostics...");
    await logAudioState();
    if (sceneRef.current) {
      console.log("ToneMusicScene is loaded:", !!sceneRef.current);
      console.log("Block count:", blocks.length);
      console.log("isPlaying:", isPlaying);
    } else {
      console.log("No active ToneMusicScene");
    }
  }, [blocks.length, isPlaying]);

  const resetAudio = useCallback(async () => {
    console.log("ToneMusicContext: Resetting audio...");
    // Stop any current playback with safe null handling
    if (sceneRef.current) {
      try {
        // Get local reference to avoid null issues during cleanup
        const currentScene = sceneRef.current;

        if (typeof currentScene.stop === "function") {
          currentScene.stop();
        }

        if (typeof currentScene.dispose === "function") {
          currentScene.dispose();
        }

        // Clear reference only if it hasn't changed
        if (sceneRef.current === currentScene) {
          sceneRef.current = null;
        }
      } catch (error) {
        console.warn("ToneMusicContext: Error during audio reset:", error);
        sceneRef.current = null;
      }
    }
    setIsPlaying(false);

    // Reset Tone.js
    await resetAudioContext();

    console.log("ToneMusicContext: Audio reset complete");
  }, []);

  // The context value
  const contextValue: ToneMusicContextType = {
    // State
    isPlaying,
    blocks,
    isLoading,
    verbose,
    visualizationData,
    fadeDuration: fadeDuration || 2,

    // Actions
    togglePlay,
    setAudioBlocks,
    setFadeDuration,
    updateBlock,
    updateAllBlocks,
    loadBlocksFromFile,
    setVerbose,

    // Scene access
    getCurrentScene,

    // Debug utilities
    debugAudio,
    resetAudio,

    // Audio processing
    waveforms,
    generateWaveformData,
    processAudioFile,
  };

  return <ToneMusicContext.Provider value={contextValue}>{children}</ToneMusicContext.Provider>;
};

// Custom hook to use the ToneMusic context
export const useToneMusic = () => {
  const context = useContext(ToneMusicContext);
  if (context === undefined) {
    throw new Error("useToneMusic must be used within a ToneMusicProvider");
  }
  return context;
};

export default ToneMusicContext;
