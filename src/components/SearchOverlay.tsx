import React, { useState, useRef, useEffect } from "react";
import styles from "./SearchOverlay.module.css";
import { GalleryImage } from "../types";
import { Spinner } from "./Spinner";
import { Cross1Icon, DownloadIcon } from "@radix-ui/react-icons";

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
  const [filteredItems, setFilteredItems] = useState<GalleryImage[]>(items); // Filtered items state
  const searchInputRef = useRef<HTMLInputElement | null>(null); // Ref for input field

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    };
  }, []);

  // Filter logic
  const handleFilter = () => {
    const query = searchInputRef.current?.value.trim().toLowerCase() || "";
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.filename.toLowerCase().includes(query) ||
        item.cat.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  };

  const handleLongPressStart = (filename: string, currentTitle: string) => {
    longPressTimeout.current = setTimeout(() => {
      const newTitle = prompt("Edit Title:", currentTitle) || currentTitle;
      const updatedTitles = { ...editedTitles, [filename]: newTitle };

      setEditedTitles(updatedTitles);
      localStorage.setItem("editedTitles", JSON.stringify(updatedTitles)); // Persist changes
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleClose = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 200);
  };

  const exportEditedTitles = () => {
    const updatedAssets = items.map((item) => ({
      ...item,
      title: editedTitles[item.filename] || item.title,
    }));

    const formattedExport = `${JSON.stringify(updatedAssets, null, 2)};`;

    const blob = new Blob([formattedExport], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "assets.json";
    link.click();

    URL.revokeObjectURL(url);
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
            ref={searchInputRef} // Reference to the input field
            placeholder="Find by title, filename, or category..."
            className={styles.searchInput}
            disabled={isLoading}
            onChange={handleFilter} // Trigger filtering on input change
          />
          {hasEdits && (
            <button onClick={exportEditedTitles} className={styles.exportButton}>
              <DownloadIcon />
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
            filteredItems.map((item) => ( // Display filtered items
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
