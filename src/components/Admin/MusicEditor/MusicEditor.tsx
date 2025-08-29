import React, { useCallback } from "react";
import AudioBlockEditor from "./AudioBlockEditor/AudioBlockEditor";
import { useToneMusic } from "@/context/ToneMusicContext";
import styles from "./MusicEditor.module.css";

/**
 * MusicEditor component for the admin panel
 * Wraps the AudioBlockEditor component and handles audio playback
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
      <AudioBlockEditor initialBlocks={[]} title="Audio Block Editor" onChange={handleChange} />
    </div>
  );
}
