import React, { useState } from "react";
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        zIndex: 9999,
        overflowY: "auto",
      }}
    >
      <button style={{ position: "absolute", top: 12, right: 12 }} onClick={onClose}>
        Close
      </button>
      <h2 style={{ textAlign: "center" }}>Audio Controls</h2>
      {localBlocks.map((block, idx) => (
        <div key={block.name} style={{ margin: 20, padding: 20, background: "#222", borderRadius: 10 }}>
          <h4>{block.name}</h4>
          {/* Volume */}
          <label>
            Volume: {block.volume}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={block.volume}
              onChange={(e) => handleBlockChange(idx, { volume: parseFloat(e.target.value) })}
            />
          </label>
          <br />
          {/* Pan */}
          <label>
            Pan: {block.pan ?? 0}
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={block.pan ?? 0}
              onChange={(e) => handleBlockChange(idx, { pan: parseFloat(e.target.value) })}
            />
          </label>
          <br />
          {/* Playback Rate */}
          <label>
            Playback Rate: {block.playbackRate ?? 1}
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.01}
              value={block.playbackRate ?? 1}
              onChange={(e) => handleBlockChange(idx, { playbackRate: parseFloat(e.target.value) })}
            />
          </label>
          <br />
          {/* Loop */}
          <label>
            Loop:
            <input type="checkbox" checked={!!block.loop} onChange={(e) => handleBlockChange(idx, { loop: e.target.checked })} />
          </label>
          <br />
          {/* Loop Start/End */}
          <label>
            Loop Start: {block.loopStart ?? ""}
            <input
              type="number"
              min={0}
              step={0.01}
              value={block.loopStart ?? ""}
              onChange={(e) => handleBlockChange(idx, { loopStart: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
            />
          </label>
          <label>
            Loop End: {block.loopEnd ?? ""}
            <input
              type="number"
              min={0}
              step={0.01}
              value={block.loopEnd ?? ""}
              onChange={(e) => handleBlockChange(idx, { loopEnd: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
            />
          </label>
          <br />
          {/* Quantize */}
          <label>
            Quantize:
            <select value={block.quantize ?? ""} onChange={(e) => handleBlockChange(idx, { quantize: e.target.value })}>
              <option value="">(none)</option>
              {quantizeOptions.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </label>
          <br />
          {/* Delay/FX */}
          <label>
            Delay:
            <input type="checkbox" checked={!!block.delay} onChange={(e) => handleBlockChange(idx, { delay: e.target.checked })} />
          </label>
          <label>
            Delay Time:
            <input
              type="text"
              value={block.delayTime ?? ""}
              placeholder="e.g. 4n"
              onChange={(e) => handleBlockChange(idx, { delayTime: e.target.value })}
              style={{ width: "4em" }}
            />
          </label>
          <label>
            Delay Feedback:
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={block.delayFeedback ?? ""}
              onChange={(e) => handleBlockChange(idx, { delayFeedback: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
            />
          </label>
          <br />
          {/* Reverb */}
          <label>
            Reverb:
            <input type="checkbox" checked={!!block.reverb} onChange={(e) => handleBlockChange(idx, { reverb: e.target.checked })} />
          </label>
          <br />
          {/* Reverse */}
          <label>
            Reverse:
            <input type="checkbox" checked={!!block.reverse} onChange={(e) => handleBlockChange(idx, { reverse: e.target.checked })} />
          </label>
        </div>
      ))}
    </div>
  );
};

export default ToneMusicOverlay;
