import React, { useCallback } from "react";
import ToneMusicOverlay from "@/components/ToneMusicSystemOverlay";
import { useToneMusic } from "@/context/ToneMusicContext";
import styles from "./MusicEditor.module.css";

/**
 * MusicEditor component for the admin panel
 * Wraps the ToneMusicOverlay component and handles audio playback
 */
export function MusicEditor() {
  const { isPlaying, togglePlay } = useToneMusic();

  const handleChange = useCallback(
    (blocks: any, idx: any, param: any) => {
      if (param === "close" && isPlaying) {
        togglePlay().catch((err: any) => console.error("Error stopping playback:", err));
      }
    },
    [isPlaying, togglePlay],
  );

  return (
    <div className={styles.container}>
      <ToneMusicOverlay initialBlocks={[]} title="Audio Block Editor" onChange={handleChange} />
    </div>
  );
}
