import React, { useState } from "react";
import { FileSoundBlock } from "@/audio/ToneMusicScene";

interface ToneMusicOverlayProps {
  blocks: FileSoundBlock[];
  onChange: (blocks: FileSoundBlock[]) => void;
  onClose: () => void;
}

const ToneMusicOverlay: React.FC<ToneMusicOverlayProps> = ({ blocks, onChange, onClose }) => {
  const [localBlocks, setLocalBlocks] = useState<FileSoundBlock[]>(blocks);

  const handleBlockChange = (idx: number, changes: Partial<FileSoundBlock>) => {
    const updated = localBlocks.map((b, i) => (i === idx ? { ...b, ...changes } : b));
    setLocalBlocks(updated);
    onChange(updated); // propagate to parent (can update the scene)
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
          <label>
            Playback Rate: {block.playbackRate ?? 1}
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={block.playbackRate ?? 1}
              onChange={(e) => handleBlockChange(idx, { playbackRate: parseFloat(e.target.value) })}
            />
          </label>
          <br />
          <label>
            Reverb:
            <input type="checkbox" checked={!!block.reverb} onChange={(e) => handleBlockChange(idx, { reverb: e.target.checked })} />
          </label>
          <label>
            Delay:
            <input type="checkbox" checked={!!block.delay} onChange={(e) => handleBlockChange(idx, { delay: e.target.checked })} />
          </label>
          {/* Add more controls for delayTime, delayFeedback, etc. as needed */}
        </div>
      ))}
    </div>
  );
};

export default ToneMusicOverlay;
