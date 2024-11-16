import React, { useState, useRef, useEffect } from "react";
import styles from "./SearchOverlay.module.css";
import { GalleryImage } from "../types";
import { Spinner } from "./Spinner";
import { Cross1Icon } from "@radix-ui/react-icons";

interface SearchOverlayProps {
  items: GalleryImage[];
  isLoading: boolean;
  onClose: () => void;
  onItemSelect: (category: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  items,
  isLoading,
  onClose,
  onItemSelect,
}) => {
  const [isVisible, setIsVisible] = useState(false); // Controls fade-in
  const [isContentVisible, setIsContentVisible] = useState(false); // Controls content collapse

  const [editedTitles, setEditedTitles] = useState<Record<string, string>>(
    () => JSON.parse(localStorage.getItem("editedTitles") || "{}")
  );

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Trigger the fade-in effect
    setIsVisible(true);

    // Slight delay for content expand effect
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 200); // Adjust delay as needed

    return () => {
      // Clean up any long press timeouts or timers
      clearTimeout(timer);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    };
  }, []);

  const handleLongPressStart = (filename: string, currentTitle: string) => {
    longPressTimeout.current = setTimeout(() => {
      const newTitle = prompt("Edit Title:", currentTitle) || currentTitle;
      const updatedTitles = { ...editedTitles, [filename]: newTitle };

      setEditedTitles(updatedTitles);
      localStorage.setItem("editedTitles", JSON.stringify(updatedTitles)); // Persist changes
    }, 500); // Long press duration
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleClose = () => {
    setIsContentVisible(false); // Collapse content
    setTimeout(() => {
      setIsVisible(false); // Fade out overlay
      setTimeout(onClose, 300); // Ensure overlay fully fades before closing
    }, 200); // Sync with animation duration
  };

  const hasEdits = items.some(
    (item) => editedTitles[item.filename] && editedTitles[item.filename] !== item.title
  );

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.visible : ""}`}
    >
      <div className={`${styles.content} ${isContentVisible ? styles.expanded : ""}`}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Find by title, filename, or category..."
            className={styles.searchInput}
            disabled={isLoading}
          />
          {hasEdits && (
            <button className={styles.exportButton}>
              Export Edits
            </button>
          )}
          <button onClick={handleClose} className={styles.closeButton}>
            <Cross1Icon />
          </button>

        </div>
        <div className={styles.results}>
          {isLoading ? (
            <div className={styles.spinner}>
              <Spinner onClick={onClose} />
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.filename}
                className={styles.resultItem}
                onClick={() => onItemSelect(item.cat)}
                onMouseDown={() =>
                  handleLongPressStart(
                    item.filename,
                    editedTitles[item.filename] || item.title
                  )
                }
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() =>
                  handleLongPressStart(
                    item.filename,
                    editedTitles[item.filename] || item.title
                  )
                }
                onTouchEnd={handleLongPressEnd}
              >
                <img
                  src={`assets/images/${item.filename}`}
                  alt={item.title}
                  className={styles.thumbnail}
                />
                <p>{editedTitles[item.filename] || item.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
