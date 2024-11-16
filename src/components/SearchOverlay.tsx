import React, { useState, useRef, useEffect } from "react";
import styles from "./SearchOverlay.module.css";
import { GalleryImage } from "../types";
import { Spinner } from "./Spinner";
import { Cross1Icon, DownloadIcon } from "@radix-ui/react-icons";
import { LightBoxImage } from "./LightBoxImage";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [filteredItems, setFilteredItems] = useState<GalleryImage[]>(items);
  const [editedTitles, setEditedTitles] = useState<Record<string, string>>(
    () => JSON.parse(localStorage.getItem("editedTitles") || "{}")
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
            ref={searchInputRef}
            placeholder="Find by title, filename, or category..."
            className={styles.searchInput}
            disabled={isLoading}
            onChange={handleFilter}
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
            filteredItems.map((item) => (
              <div
                key={item.filename}
                className={styles.resultItem}
                onClick={() => setLightboxImage(item)} // Open lightbox with image details
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
      {lightboxImage && (
        <LightBoxImage
          onClick={() => setLightboxImage(null)}
          alt={lightboxImage.title}
          src={`assets/images/${lightboxImage.filename}`}
          className={styles.lightBoxImage}
        />
      )}
    </div>
  );
};
