import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./AudioBlockEditor.module.css";
import { FileSoundBlock } from "@/audio/ToneMusicScene";
import { useToneMusic } from "@/context/ToneMusicContext";
import { useTheme } from "@/context/ThemeContext";

type ToneAnalyser = any; // Type definition for Tone.Analyser

interface WaveformData {
  data: number[];
  duration: number;
}

interface AudioBlockEditorProps {
  initialBlocks?: FileSoundBlock[];
  onChange?: (blocks: FileSoundBlock[], changedIndex?: number, changedParam?: keyof FileSoundBlock | string, value?: any) => void;
  title?: string;
  onClose?: () => void;
  visualizationData?: Uint8Array;
  isPlaying?: boolean;
}

// List of available sound block files
const SOUND_BLOCK_FILES = [
  "/assets/soundblocks/kalimba_piano_scene.json",
  "/assets/soundblocks/kalimba_piano_scene1.json",
  "/assets/soundblocks/kalimba_piano_scene2.json",
  "/assets/soundblocks/kalimba_piano_scene3.json",
  "/assets/soundblocks/kalimba_piano_scene4.json",
  "/assets/soundblocks/atellier_zukunft_scene.json",
  "/assets/soundblocks/atellier_zukunft_scene2.json",
  "/assets/soundblocks/atellier_zukunft_scene3.json",
  "/assets/soundblocks/atellier_zukunft_scene4.json",
  "/assets/soundblocks/arsenal_scene.json",
  "/assets/soundblocks/bowltest_scene.json",
  "/assets/soundblocks/test_scene.json",
];

// Reference to the main ToneMusicSystem component for standalone mode
let mainToneMusicSystem: HTMLElement | null = null;

// Color palette for different sound blocks
const BLOCK_COLORS = [
  "#4a90e2", // blue
  "#e25c4a", // red
  "#50e24a", // green
  "#e2d74a", // yellow
  "#9c4ae2", // purple
  "#4ae2d7", // cyan
  "#e24a9c", // pink
  "#e29c4a", // orange
];

const quantizeOptions = ["1m", "2n", "4n", "8n", "16n", "32n", "3n", "6n", "12n"];

const AudioBlockEditor: React.FC<AudioBlockEditorProps> = ({
  initialBlocks,
  onChange,
  title = "Audio Block Editor",
  visualizationData: propVisualizationData,
  isPlaying: propIsPlaying,
}) => {
  const { currentTheme } = useTheme(); // Use theme context

  const [selectedFile, setSelectedFile] = useState(SOUND_BLOCK_FILES[0]);
  const [localBlocks, setLocalBlocks] = useState<FileSoundBlock[]>(initialBlocks || []);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, { blob: Blob; url: string }>>(new Map());
  const [isLoadingWaveform, setIsLoadingWaveform] = useState(false);
  const [useMainSystem, setUseMainSystem] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const xyValues = useRef<{ [key: string]: { x: number; y: number } }>({});
  const internalMusicSystemRef = useRef<HTMLDivElement>(null);

  // Use the ToneMusic context
  const {
    isPlaying: contextIsPlaying,
    togglePlay,
    isLoading: loading,
    visualizationData: contextVisualizationData,
    waveforms,
    processAudioFile,
    updateBlock: contextUpdateBlock,
    setAudioBlocks,
    updateAllBlocks,
    loadBlocksFromFile,
    debugAudio,
    resetAudio,
    blocks,
    verbose,
    getCurrentScene,
    fadeDuration,
    setFadeDuration,
  } = useToneMusic();

  // Use props if provided, otherwise use context values
  const isPlaying = propIsPlaying !== undefined ? propIsPlaying : contextIsPlaying;
  const visualizationData = propVisualizationData || contextVisualizationData;

  // Collect debug info on demand
  const handleDebugPanel = async () => {
    setShowDebug((prev) => !prev);
    if (!showDebug) {
      // Collect as much info as possible
      const scene = getCurrentScene?.();
      setDebugInfo({
        isPlaying,
        blockCount: blocks.length,
        verbose,
        sceneLoaded: !!scene,
        sceneType: scene ? scene.constructor?.name : "none",
        sceneBlocks:
          typeof scene?.getBlocks === "function"
            ? scene.getBlocks().map((b: any) => ({
                name: b.name,
                filePath: b.filePath,
                volume: b.volume,
                pan: b.pan,
                playbackRate: b.playbackRate,
                loop: b.loop,
              }))
            : [],
        waveforms: Array.from(waveforms.entries()).map(([k, v]) => ({
          file: k,
          duration: v.duration,
          data: v.data.slice(0, 8), // show first 8 points for compactness
        })),
        visualizationData: Array.from(visualizationData.slice(0, 8)),
      });
      debugAudio?.();
    }
  };

  // Initialize main component on mount
  useEffect(() => {
    // Try to find the main ToneMusicSystem component in the DOM once, not on every render
    const timer = setTimeout(() => {
      mainToneMusicSystem = document.querySelector("[data-tonemusicscene='main']");
      if (mainToneMusicSystem) {
        console.log("AudioBlockEditor: Main ToneMusicSystem found in DOM");
      } else {
        console.log("AudioBlockEditor: Main ToneMusicSystem not found in DOM - standalone mode only");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      // Clean up uploaded file URLs
      uploadedFiles.forEach((file) => {
        URL.revokeObjectURL(file.url);
      });
    };
  }, []);

  // Load blocks only once on initial mount, not on every render
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      setLocalBlocks(initialBlocks);
      setAudioBlocks(initialBlocks);
    } else if (localBlocks.length === 0) {
      // Load the first sound block file by default, but only once
      loadSoundBlocksFromFile(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Cache over refs to persist and avoid redundant loading
  const fileCache = useRef<Map<string, FileSoundBlock[]>>(new Map());

  // Use the fadeDuration from context or default to 1.5 seconds
  const fadeOutDuration = fadeDuration || 1.5;

  const loadSoundBlocksFromFile = async (filePath: string) => {
    try {
      // Check if we've already loaded this file
      if (fileCache.current.has(filePath)) {
        console.log(`AudioBlockEditor: Using cached sound blocks for ${filePath}`);
        const cachedData = fileCache.current.get(filePath)!;
        setLocalBlocks(cachedData);
        await setAudioBlocks(cachedData);
        setSelectedFile(filePath);
        return;
      }

      console.log(`AudioBlockEditor: Loading sound blocks from ${filePath}`);

      // Use fetch directly instead of the context function to avoid type issues
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load sound blocks: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`AudioBlockEditor: Loaded ${data.length} sound blocks`);

      // Cache the data
      fileCache.current.set(filePath, data);

      // Update local state
      setLocalBlocks(data);

      // Update the context
      await setAudioBlocks(data);

      setSelectedFile(filePath);
      console.log("AudioBlockEditor: Sound blocks loaded successfully");
    } catch (error) {
      console.error("AudioBlockEditor: Error loading sound blocks:", error);
    }
  };

  const handleBlockChange = (idx: number, changes: Partial<FileSoundBlock>) => {
    console.log(`AudioBlockEditor: Changing block ${idx}:`, changes);
    const updated = localBlocks.map((b, i) => (i === idx ? { ...b, ...changes } : b));
    setLocalBlocks(updated);

    // Update XY position if applicable
    if (changes.pan !== undefined || changes.volume !== undefined) {
      const block = updated[idx];
      xyValues.current[block.name] = {
        x: block.pan || 0,
        y: block.volume || 0,
      };
      console.log(`AudioBlockEditor: Updated XY values for ${block.name}`);
    }

    // Update through our context
    contextUpdateBlock(idx, changes);

    // If onChange is provided (for App.tsx integration), call it
    if (onChange) {
      // Special case for App.tsx integration
      if (useMainSystem) {
        // For better integration with App.tsx, send the whole blocks array
        // with a command to replace all blocks (better than updating one at a time)
        console.log(`AudioBlockEditor: Sending full blocks update to main app`);
        onChange(updated, -1, "setBlocks" as any, true);
      } else {
        // Traditional change handling for backward compatibility
        const [changedParam] = Object.keys(changes) as (keyof FileSoundBlock)[];
        console.log(`AudioBlockEditor: Sending change to main app - ${changedParam}:`, (changes as any)[changedParam]);
        onChange(updated, idx, changedParam, (changes as any)[changedParam]);
      }
    }
  };

  const handleXYPadChange = (idx: number, x: number, y: number) => {
    const block = localBlocks[idx];
    // Map x to pan (-1 to 1) and y to volume (0 to 1, inverted)
    const pan = x * 2 - 1;
    const volume = 1 - y;

    handleBlockChange(idx, { pan, volume });
  };

  const handlePlayToggle = async () => {
    console.log("AudioBlockEditor: Play/Stop button clicked, current state:", isPlaying);

    // First ensure we're using the latest blocks in the context
    updateAllBlocks(localBlocks);

    try {
      // Use the context's toggle function with the fadeOutDuration
      const wasPlaying = contextIsPlaying;
      await togglePlay(fadeOutDuration);
      console.log(`AudioBlockEditor: Toggled playback from ${wasPlaying} to ${!wasPlaying} with fade duration ${fadeOutDuration}s`);

      // Handle onChange for backward compatibility
      if (onChange && useMainSystem) {
        onChange(localBlocks, -1, wasPlaying ? ("stop" as any) : ("play" as any), !wasPlaying);
      }
    } catch (error) {
      console.error("AudioBlockEditor: Error toggling playback:", error);
    }
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(localBlocks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "soundblocks.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("AudioBlockEditor: File selection changed");
    // Toggle off playback if needed
    if (contextIsPlaying) {
      try {
        await togglePlay(fadeOutDuration);
      } catch (error) {
        console.error("Error stopping playback:", error);
      }
    }
    console.log(`AudioBlockEditor: Loading file: ${e.target.value}`);
    await loadSoundBlocksFromFile(e.target.value);
  };

  const handleApplyChanges = async () => {
    console.log("AudioBlockEditor: Applying changes to main system");
    await setAudioBlocks(localBlocks);

    // For backward compatibility
    if (onChange) {
      console.log("AudioBlockEditor: Sending updated blocks to main app:", localBlocks);
      onChange(localBlocks, -1, "setBlocks" as any, true);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const { blob, url, waveform } = await processAudioFile(file);

      // Store the uploaded file
      const filename = `/uploaded/${file.name}`;
      setUploadedFiles((prev) => new Map(prev).set(filename, { blob, url }));

      // Update the block with the new file path
      handleBlockChange(idx, { filePath: filename });
    } catch (error) {
      console.error("Error processing uploaded file:", error);
    }
  };

  // Handle loop marker change
  const handleLoopMarkerChange = (idx: number, start: number | undefined, end: number | undefined) => {
    handleBlockChange(idx, {
      loopStart: start,
      loopEnd: end,
    });
  };

  const getBlockColor = (index: number) => {
    return BLOCK_COLORS[index % BLOCK_COLORS.length];
  };

  // Initialize XY values if needed
  useEffect(() => {
    localBlocks.forEach((block, idx) => {
      if (!xyValues.current[block.name]) {
        xyValues.current[block.name] = {
          x: block.pan || 0,
          y: 1 - (block.volume || 0),
        };
      }
    });
  }, [localBlocks]);

  return (
    <div className={styles.overlay} id="music-editor-page">
      <div className={styles.pageHeader}>
        {/*<h2 className={styles.heading}>{title}</h2>*/}
        {/* Audio Visualization */}
        <div className={styles.visualizer}>
          {Array.from(visualizationData.slice(0, 64)).map((value, i) => (
            <div
              key={i}
              className={styles.visualizerBar}
              style={{
                height: `${Math.max(2, value / 2.55)}%`,
                opacity: isPlaying ? 0.7 + value / 765 : 0.3,
                backgroundColor: isPlaying ? `hsl(${200 + (i / 64) * 60}, 70%, ${40 + (value / 255) * 30}%)` : "#444",
              }}
            ></div>
          ))}
        </div>
        {/* Top Controls Bar */}
        <div className={styles.controlBar}>
          <div className={styles.fileSelector}>
            <label htmlFor="soundBlockFile">Sound Block File:</label>
            <select id="soundBlockFile" value={selectedFile} onChange={handleFileChange} disabled={loading || isPlaying} className={styles.fileSelect}>
              {SOUND_BLOCK_FILES.map((file) => (
                <option key={file} value={file}>
                  {file.split("/").pop()?.replace(".json", "")}
                </option>
              ))}
            </select>
            {loading && <span className={styles.loadingIndicator}>Loading...</span>}
          </div>

          <div className={styles.playbackControls}>
            <button
              className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
              onClick={handlePlayToggle}
              disabled={loading || localBlocks.length === 0}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>

            <button className={styles.applyButton} onClick={handleApplyChanges} disabled={loading || !onChange}>
              Apply Changes
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        {/* Hidden ToneMusicSystem for standalone mode */}
        <div ref={internalMusicSystemRef} style={{ display: "none" }}>
          {!useMainSystem && <div data-tonemusicscene="internal"></div>}
        </div>

        {/* XY Control Pad */}
        <div className={styles.xyPadContainer}>
          <h3 className={styles.sectionHeading}>XY Control Pad (Volume/Pan)</h3>
          <div className={styles.xyPad}>
            {/* Grid lines */}
            <div className={styles.xyGrid}>
              {Array.from({ length: 5 }).map((_, i) => (
                <React.Fragment key={`grid-${i}`}>
                  <div className={styles.xyGridLineH} style={{ top: `${i * 25}%` }} />
                  <div className={styles.xyGridLineV} style={{ left: `${i * 25}%` }} />
                </React.Fragment>
              ))}
            </div>

            {/* Center lines */}
            <div className={styles.xyGridCenterH} />
            <div className={styles.xyGridCenterV} />

            {/* Axis labels */}
            <div className={styles.xyLabelLeft}>Volume</div>
            <div className={styles.xyLabelTop}>Pan</div>

            {/* Block markers */}
            {localBlocks.map((block, idx) => {
              const xyPos = xyValues.current[block.name] || { x: 0.5, y: 0.5 };
              // Map from pan (-1 to 1) to x (0 to 1)
              const displayX = ((block.pan || 0) + 1) / 2;
              // Map from volume (0 to 1) to y (1 to 0, inverted)
              const displayY = 1 - (block.volume || 0);

              return (
                <div
                  key={`xy-${idx}`}
                  className={`${styles.xyMarker} ${activeBlockIndex === idx ? styles.activeMarker : ""}`}
                  style={{
                    left: `${displayX * 100}%`,
                    top: `${displayY * 100}%`,
                    backgroundColor: getBlockColor(idx),
                  }}
                  onClick={() => setActiveBlockIndex(idx)}
                  onMouseDown={(e) => {
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                      const y = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height));
                      handleXYPadChange(idx, x, y);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                >
                  {block.name.slice(0, 2)}
                </div>
              );
            })}
          </div>
        </div>
        {/* Blocks Grid */}
        <div className={styles.blocksGrid}>
          {localBlocks.map((block, idx) => (
            <div
              key={block.name}
              className={`${styles.card} ${activeBlockIndex === idx ? styles.activeCard : ""}`}
              onClick={() => setActiveBlockIndex(idx)}
              style={{ borderColor: getBlockColor(idx) }}
            >
              <div className={styles.cardHeader} style={{ backgroundColor: getBlockColor(idx) }}>
                <h4 className={styles.blockName}>{block.name}</h4>
                <div className={styles.fileInfo}>
                  {block.filePath?.startsWith("/uploaded/") ? "📤 " + block.filePath.split("/").pop() : block.filePath?.split("/").pop()}
                </div>
              </div>

              <div className={styles.blockVisualizer}>
                {waveforms.has(block.filePath || "") ? (
                  <div className={styles.waveformContainer}>
                    <div className={styles.waveform}>
                      {waveforms.get(block.filePath || "")?.data.map((value, i) => (
                        <div
                          key={`waveform-${i}`}
                          className={styles.waveformBar}
                          style={{
                            height: `${Math.max(5, value * 100)}%`,
                            opacity: isPlaying ? 0.7 + value * 0.3 : 0.5,
                            backgroundColor: getBlockColor(idx),
                          }}
                        ></div>
                      ))}
                    </div>

                    {/* Loop region markers */}
                    {waveforms.has(block.filePath || "") && (
                      <div className={styles.loopRegion}>
                        <div
                          className={styles.loopStart}
                          style={{
                            left: `${((block.loopStart || 0) / (waveforms.get(block.filePath || "")?.duration || 1)) * 100}%`,
                          }}
                          onMouseDown={(e) => {
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                              const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                              const duration = waveforms.get(block.filePath || "")?.duration || 1;
                              const newStart = x * duration;
                              handleLoopMarkerChange(idx, newStart, block.loopEnd);
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener("mousemove", handleMouseMove);
                              document.removeEventListener("mouseup", handleMouseUp);
                            };

                            document.addEventListener("mousemove", handleMouseMove);
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                        <div
                          className={styles.loopEnd}
                          style={{
                            left: `${
                              ((block.loopEnd || waveforms.get(block.filePath || "")?.duration || 1) / (waveforms.get(block.filePath || "")?.duration || 1)) *
                              100
                            }%`,
                          }}
                          onMouseDown={(e) => {
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                              const x = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                              const duration = waveforms.get(block.filePath || "")?.duration || 1;
                              const newEnd = x * duration;
                              handleLoopMarkerChange(idx, block.loopStart, newEnd);
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener("mousemove", handleMouseMove);
                              document.removeEventListener("mouseup", handleMouseUp);
                            };

                            document.addEventListener("mousemove", handleMouseMove);
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        />
                        <div
                          className={styles.loopArea}
                          style={{
                            left: `${((block.loopStart || 0) / (waveforms.get(block.filePath || "")?.duration || 1)) * 100}%`,
                            width: `${
                              (((block.loopEnd || waveforms.get(block.filePath || "")?.duration || 1) - (block.loopStart || 0)) /
                                (waveforms.get(block.filePath || "")?.duration || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    )}

                    <div className={styles.waveformLabels}>
                      <span className={styles.timeLabel}>0s</span>
                      <span className={styles.timeLabel}>{waveforms.get(block.filePath || "")?.duration.toFixed(1)}s</span>
                    </div>
                  </div>
                ) : isLoadingWaveform ? (
                  <div className={styles.loadingWaveform}>Loading waveform...</div>
                ) : (
                  <div className={styles.waveform}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`waveform-${i}`}
                        className={styles.waveformBar}
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                          opacity: isPlaying ? 0.6 + Math.random() * 0.4 : 0.3,
                          backgroundColor: getBlockColor(idx),
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.propertyGrid}>
                {/* Main controls */}
                <div className={styles.mainControls}>
                  {/* Audio File */}
                  <div className={styles.controlGroup}>
                    <div className={styles.label}>Audio File:</div>
                    <div className={styles.fileUploadContainer}>
                      <div className={styles.filePath}>{block.filePath || "No file"}</div>
                      <label className={styles.fileUploadBtn}>
                        Upload
                        <input type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, idx)} />
                      </label>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className={styles.controlGroup}>
                    <div className={styles.label}>Volume:</div>
                    <div className={styles.value}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={block.volume}
                        onChange={(e) => handleBlockChange(idx, { volume: parseFloat(e.target.value) })}
                      />
                      <span className={styles.valueText}>{block.volume?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pan */}
                  <div className={styles.controlGroup}>
                    <div className={styles.label}>Pan:</div>
                    <div className={styles.value}>
                      <input
                        type="range"
                        min={-1}
                        max={1}
                        step={0.01}
                        value={block.pan ?? 0}
                        onChange={(e) => handleBlockChange(idx, { pan: parseFloat(e.target.value) })}
                      />
                      <span className={styles.valueText}>{(block.pan ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Playback Rate */}
                  <div className={styles.controlGroup}>
                    <div className={styles.label}>Rate:</div>
                    <div className={styles.value}>
                      <input
                        type="range"
                        min={0.2}
                        max={2}
                        step={0.01}
                        value={block.playbackRate ?? 1}
                        onChange={(e) => handleBlockChange(idx, { playbackRate: parseFloat(e.target.value) })}
                      />
                      <span className={styles.valueText}>{(block.playbackRate ?? 1).toFixed(2)}x</span>
                    </div>
                  </div>
                </div>

                {/* Advanced controls in collapsible section */}
                <details className={styles.advancedControls}>
                  <summary>Advanced Controls</summary>

                  <div className={styles.advancedControlsGrid}>
                    {/* Loop */}
                    <div className={styles.label}>Loop:</div>
                    <div className={styles.value}>
                      <input type="checkbox" id={`loop-${idx}`} checked={!!block.loop} onChange={(e) => handleBlockChange(idx, { loop: e.target.checked })} />
                      <label htmlFor={`loop-${idx}`} className={styles.toggleLabel}></label>
                    </div>

                    {/* Loop Start */}
                    <div className={styles.label}>Loop Start:</div>
                    <div className={styles.value}>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={block.loopStart ?? ""}
                        onChange={(e) => handleBlockChange(idx, { loopStart: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                      />
                    </div>

                    {/* Loop End */}
                    <div className={styles.label}>Loop End:</div>
                    <div className={styles.value}>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={block.loopEnd ?? ""}
                        onChange={(e) => handleBlockChange(idx, { loopEnd: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                      />
                    </div>

                    {/* Quantize */}
                    <div className={styles.label}>Quantize:</div>
                    <div className={styles.value}>
                      <select value={block.quantize ?? ""} onChange={(e) => handleBlockChange(idx, { quantize: e.target.value })}>
                        <option value="">(none)</option>
                        {quantizeOptions.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Effects section */}
                    <div className={styles.label}>Effects:</div>
                    <div className={styles.effectsGrid}>
                      {/* Delay */}
                      <div className={styles.effectToggle}>
                        <input
                          type="checkbox"
                          id={`delay-${idx}`}
                          checked={!!block.delay}
                          onChange={(e) => handleBlockChange(idx, { delay: e.target.checked })}
                        />
                        <label htmlFor={`delay-${idx}`}>Delay</label>
                      </div>

                      {/* Reverb */}
                      <div className={styles.effectToggle}>
                        <input
                          type="checkbox"
                          id={`reverb-${idx}`}
                          checked={!!block.reverb}
                          onChange={(e) => handleBlockChange(idx, { reverb: e.target.checked })}
                        />
                        <label htmlFor={`reverb-${idx}`}>Reverb</label>
                      </div>

                      {/* Reverse */}
                      <div className={styles.effectToggle}>
                        <input
                          type="checkbox"
                          id={`reverse-${idx}`}
                          checked={!!block.reverse}
                          onChange={(e) => handleBlockChange(idx, { reverse: e.target.checked })}
                        />
                        <label htmlFor={`reverse-${idx}`}>Reverse</label>
                      </div>
                    </div>

                    {/* Delay Time */}
                    <div className={styles.label}>Delay Time:</div>
                    <div className={styles.value}>
                      <input
                        type="text"
                        value={block.delayTime ?? ""}
                        placeholder="e.g. 4n"
                        onChange={(e) => handleBlockChange(idx, { delayTime: e.target.value })}
                      />
                    </div>

                    {/* Delay Feedback */}
                    <div className={styles.label}>Delay Feedback:</div>
                    <div className={styles.value}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={block.delayFeedback ?? 0}
                        onChange={(e) => handleBlockChange(idx, { delayFeedback: parseFloat(e.target.value) })}
                      />
                      <span className={styles.valueText}>{(block.delayFeedback ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.saveButton} onClick={handleSave}>
            Save as JSON
          </button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className={styles.debugPanel}>
            {/* Audio mode selector */}
            <div className={styles.playbackModeContainer} style={{ marginTop: "20px" }}>
              <div className={styles.playbackModeSelector}>
                <label className={styles.modeLabel}>
                  <input type="checkbox" checked={useMainSystem} onChange={() => setUseMainSystem(!useMainSystem)} disabled={isPlaying} />
                  Use main app audio system
                </label>
              </div>
              <div className={styles.playbackNotice}>
                {useMainSystem
                  ? "Using main app audio system - changes will be synced with the app"
                  : "Using standalone audio system - you can test sounds independently"}
              </div>
            </div>
            <div className={styles.debugPanelHeader}>Audio Debug Info</div>
            <div className={styles.debugPanelContent}>
              <div>
                <strong>Playback:</strong>
                <div>isPlaying: {String(debugInfo?.isPlaying)}</div>
                <div>blockCount: {debugInfo?.blockCount}</div>
                <div>verbose: {String(debugInfo?.verbose)}</div>
                <div>sceneLoaded: {String(debugInfo?.sceneLoaded)}</div>
                <div>sceneType: {debugInfo?.sceneType}</div>
              </div>
              <div>
                <strong>Blocks:</strong>
                <div className={styles.debugSceneBlocks}>
                  {debugInfo?.sceneBlocks?.map((b: any, i: number) => (
                    <div key={i} className={styles.debugBlock}>
                      {b.name} <span className={styles.debugFilePath}>{b.filePath?.split("/").pop()}</span>
                      <span className={styles.debugParam}>vol:{b.volume}</span>
                      <span className={styles.debugParam}>pan:{b.pan}</span>
                      <span className={styles.debugParam}>rate:{b.playbackRate}</span>
                      <span className={styles.debugParam}>loop:{String(b.loop)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <strong>Waveforms:</strong>
                <div className={styles.debugWaveforms}>
                  {debugInfo?.waveforms?.map((w: any, i: number) => (
                    <div key={i}>
                      {w.file?.split("/").pop()} ({w.duration?.toFixed(2)}s): [{w.data.join(", ")}]
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <strong>VisData:</strong>
                <div>[{debugInfo?.visualizationData?.join(", ")}]</div>
              </div>
            </div>
            <div className={styles.debugPanelButtons}>
              <button onClick={() => debugAudio()} className={styles.debugButton}>
                Diagnose
              </button>
              <button onClick={() => resetAudio()} className={styles.debugButton}>
                Reset
              </button>
              <button onClick={() => togglePlay(fadeOutDuration)} className={styles.debugButton}>
                Toggle Play
              </button>
              <button onClick={() => setShowDebug(false)} className={styles.debugButton}>
                Close
              </button>
            </div>
          </div>
        )}
        {/* Floating debug toggle */}
        <button onClick={handleDebugPanel} className={styles.debugToggleButton} title="Show Debug Panel">
          D
        </button>
      </div>
      {/*<div className={styles.pageFooter}>
        <div className={styles.buttonContainer}>
          <button onClick={handleSave} className={styles.saveButton} disabled={loading || localBlocks.length === 0}>
            Save to File
          </button>
        </div>
      </div>*/}
    </div>
  );
};

export default AudioBlockEditor;
