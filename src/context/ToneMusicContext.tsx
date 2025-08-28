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

  // Actions
  togglePlay: () => Promise<void>;
  setAudioBlocks: (blocks: FileSoundBlock[]) => void;
  updateBlock: (index: number, changes: Partial<FileSoundBlock>) => void;
  updateAllBlocks: (blocks: FileSoundBlock[]) => void;
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
  autoPlay?: boolean;
  initialVerbose?: boolean;
}

export const ToneMusicProvider: React.FC<ToneMusicProviderProps> = ({ children, initialBlocks = [], autoPlay = false, initialVerbose = false }) => {
  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [blocks, setBlocks] = useState<FileSoundBlock[]>(initialBlocks);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verbose, setVerbose] = useState<boolean>(initialVerbose);
  const [visualizationData, setVisualizationData] = useState<Uint8Array>(new Uint8Array(128).fill(0));
  const [waveforms, setWaveforms] = useState<Map<string, WaveformData>>(new Map());

  // Refs
  const sceneRef = useRef<ToneMusicScene | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Tone.js and analyser for visualizations
  useEffect(() => {
    const initTone = async () => {
      try {
        // Force create a clean Tone context
        if (Tone.context.state !== "running") {
          await Tone.start();
        }

        if (!analyserRef.current) {
          analyserRef.current = new Tone.Analyser("fft", 128);
          Tone.Destination.connect(analyserRef.current);
          console.log("ToneMusicContext: Analyzer initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize audio analyzer:", error);
      }
    };

    initTone();

    return () => {
      // Clean up
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (analyserRef.current) {
        try {
          analyserRef.current.dispose();
          analyserRef.current = null;
        } catch (error) {
          console.warn("Error disposing analyzer:", error);
        }
      }

      if (sceneRef.current) {
        try {
          sceneRef.current.stop();
          sceneRef.current.dispose();
          sceneRef.current = null;
        } catch (error) {
          console.warn("Error disposing scene:", error);
        }
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
  const togglePlay = useCallback(async () => {
    try {
      console.log("ToneMusicContext: Toggle play called. Current state:", isPlaying);
      console.log("ToneMusicContext: Blocks available:", blocks.length);

      // Ensure audio context is running
      if (Tone.context.state !== "running") {
        console.log("ToneMusicContext: Starting Tone.js audio context");
        await Tone.start();
      }

      if (isPlaying) {
        // Stop playback
        if (sceneRef.current) {
          if (verbose) console.log("ToneMusicContext: Stopping playback and fading out");
          try {
            await sceneRef.current.fadeOut?.(2);
            sceneRef.current.stop();
            // Clean up Tone.js
            Tone.Transport.cancel();
            Tone.Transport.stop();
          } catch (error) {
            console.error("ToneMusicContext: Error during fadeout:", error);
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
              sceneRef.current.stop();
              sceneRef.current.dispose();
              sceneRef.current = null;
            }

            // Create the new scene explicitly
            console.log("ToneMusicContext: Creating new ToneMusicScene with", blocks.length, "blocks");
            const newScene = new ToneMusicScene(blocks, true, true);
            console.log("ToneMusicContext: Loading audio files...");
            await newScene.load();
            console.log("ToneMusicContext: Audio files loaded successfully");
            sceneRef.current = newScene;

            // Actual playback
            console.log("ToneMusicContext: Starting quantized playback...");
            await newScene.scheduleQuantizedPlayback();
            console.log("ToneMusicContext: Playback started successfully");

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
  }, [isPlaying, blocks, verbose]);

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
    async (newBlocks: FileSoundBlock[], fadeOutDuration: number = 1) => {
      if (!newBlocks || newBlocks.length === 0) {
        console.warn("ToneMusicContext: Empty blocks array provided to setAudioBlocks");
      }

      console.log(`ToneMusicContext: Setting ${newBlocks?.length || 0} audio blocks`);
      setBlocks(newBlocks);

      // If playing, transition to the new scene
      if (isPlaying && newBlocks && newBlocks.length > 0) {
        try {
          if (verbose) console.log("ToneMusicContext: Transitioning to new scene with", newBlocks.length, "blocks");

          // Stop current scene explicitly with fade out
          if (sceneRef.current) {
            await sceneRef.current.fadeOut?.(fadeOutDuration);
            sceneRef.current.stop();
            sceneRef.current.dispose();
          }

          // Create a new scene (don't transition to avoid issues)
          const newScene = new ToneMusicScene(newBlocks, true, true);
          await newScene.load();
          sceneRef.current = newScene;

          // Start playback
          await newScene.scheduleQuantizedPlayback();

          console.log("ToneMusicContext: New scene started successfully");
        } catch (error) {
          console.error("ToneMusicContext: Error transitioning to new scene:", error);
        }
      } else if (sceneRef.current) {
        // If we're not playing, just stop the current scene
        sceneRef.current.stop();
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    },
    [isPlaying, verbose],
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
    // Stop any current playback
    if (sceneRef.current) {
      sceneRef.current.stop();
      sceneRef.current.dispose();
      sceneRef.current = null;
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

    // Actions
    togglePlay,
    setAudioBlocks,
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
