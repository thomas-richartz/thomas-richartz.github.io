import React, { useState } from "react";
import styles from "@/components/ToneMusicSystemOverlay.module.css";

import { FileSoundBlock } from "@/audio/ToneMusicScene";

export type ToneMusicOverlayChangeHandler = (blocks: FileSoundBlock[], changedIndex?: number, changedParam?: keyof FileSoundBlock, value?: any) => void;

interface ToneMusicOverlayProps {
  blocks: FileSoundBlock[];
  onChange: ToneMusicOverlayChangeHandler;
  onClose: () => void;
}

const quantizeOptions = ["1m", "2n", "4n", "8n", "16n", "32n", "3n", "6n", "12n"];

const ToneMusicOverlay: React.FC<ToneMusicOverlayProps> = ({ blocks, onChange, onClose }) => {
  const [localBlocks, setLocalBlocks] = useState<FileSoundBlock[]>(blocks);

  const handleBlockChange = (idx: number, changes: Partial<FileSoundBlock>) => {
    const updated = localBlocks.map((b, i) => (i === idx ? { ...b, ...changes } : b));
    setLocalBlocks(updated);
    const [changedParam] = Object.keys(changes) as (keyof FileSoundBlock)[];
    onChange(updated, idx, changedParam, (changes as any)[changedParam]);
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

  return (
    <div className={styles.overlay}>
      <button className={styles.closeButton} onClick={onClose}>
        Close
      </button>
      <h2 className={styles.heading}>Audio Controls</h2>
      {localBlocks.map((block, idx) => (
        <div key={block.name} className={styles.card}>
          <h4 className={styles.blockName}>{block.name}</h4>
          <div className={styles.propertyGrid}>
            {/* Volume */}
            <div className={styles.label}>Volume:</div>
            <div className={styles.value}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={block.volume}
                onChange={(e) => handleBlockChange(idx, { volume: parseFloat(e.target.value) })}
              />{" "}
              {block.volume}
            </div>
            {/* Pan */}
            <div className={styles.label}>Pan:</div>
            <div className={styles.value}>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={block.pan ?? 0}
                onChange={(e) => handleBlockChange(idx, { pan: parseFloat(e.target.value) })}
              />{" "}
              {block.pan ?? 0}
            </div>
            {/* Playback Rate */}
            <div className={styles.label}>Playback Rate:</div>
            <div className={styles.value}>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.01}
                value={block.playbackRate ?? 1}
                onChange={(e) => handleBlockChange(idx, { playbackRate: parseFloat(e.target.value) })}
              />{" "}
              {block.playbackRate ?? 1}
            </div>
            {/* Loop */}
            <div className={styles.label}>Loop:</div>
            <div className={styles.value}>
              <input type="checkbox" checked={!!block.loop} onChange={(e) => handleBlockChange(idx, { loop: e.target.checked })} />
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
              <select value={block.quantize ?? ""} onChange={(e) => handleBlockChange(idx, { quantize: e.target.value })} style={{ minWidth: 80 }}>
                <option value="">(none)</option>
                {quantizeOptions.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            {/* Delay */}
            <div className={styles.label}>Delay:</div>
            <div className={styles.value}>
              <input type="checkbox" checked={!!block.delay} onChange={(e) => handleBlockChange(idx, { delay: e.target.checked })} />
            </div>
            {/* Delay Time */}
            <div className={styles.label}>Delay Time:</div>
            <div className={styles.value}>
              <input
                type="text"
                value={block.delayTime ?? ""}
                placeholder="e.g. 4n"
                onChange={(e) => handleBlockChange(idx, { delayTime: e.target.value })}
                style={{ width: "4em" }}
              />
            </div>
            {/* Delay Feedback */}
            <div className={styles.label}>Delay Feedback:</div>
            <div className={styles.value}>
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={block.delayFeedback ?? ""}
                onChange={(e) => handleBlockChange(idx, { delayFeedback: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
              />
            </div>
            {/* Reverb */}
            <div className={styles.label}>Reverb:</div>
            <div className={styles.value}>
              <input type="checkbox" checked={!!block.reverb} onChange={(e) => handleBlockChange(idx, { reverb: e.target.checked })} />
            </div>
            {/* Reverse */}
            <div className={styles.label}>Reverse:</div>
            <div className={styles.value}>
              <input type="checkbox" checked={!!block.reverse} onChange={(e) => handleBlockChange(idx, { reverse: e.target.checked })} />
            </div>
          </div>
        </div>
      ))}
      <button className={styles.saveButton} onClick={handleSave}>
        Save as JSON
      </button>
    </div>
  );
};

export default ToneMusicOverlay;
