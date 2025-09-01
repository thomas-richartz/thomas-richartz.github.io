import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SearchOverlay.module.css";
import { GalleryImage } from "../types";
import { Spinner } from "./Spinner";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { LightBoxImage } from "./LightBoxImage";
import lightBoxStyles from "./LightBoxImage.module.css";

interface SearchOverlayProps {
  items: GalleryImage[];
  isLoading: boolean;
  onClose: () => void;
  onItemSelect: (category: string) => void;
  initialQuery?: string;
  autoFocus?: boolean;
  onQueryChange?: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  items,
  isLoading,
  onClose,
  onItemSelect,
  initialQuery = "",
  autoFocus = false,
  onQueryChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [filteredItems, setFilteredItems] = useState<GalleryImage[]>(items || []);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [scrollPosition, setScrollPosition] = useState(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null); // Ref for overlay
  const contentRef = useRef<HTMLDivElement | null>(null); // Ref for content container

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsContentVisible(true);
      if (searchInputRef.current) {
        if (autoFocus) {
          searchInputRef.current.focus();
        }
        if (initialQuery) {
          searchInputRef.current.value = initialQuery;
          handleFilter(initialQuery);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [initialQuery]);

  // Handle scroll animations
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener("scroll", handleScroll);
      return () => content.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        console.log("Outside click detected. Closing overlay.");
        handleClose();
      }
    };

    // Use `pointerdown` for better support across devices
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const handleFilter = (inputQuery?: string) => {
    const query = inputQuery !== undefined ? inputQuery.trim().toLowerCase() : searchInputRef.current?.value.trim().toLowerCase() || "";

    setSearchQuery(query);

    // Call the onQueryChange callback if provided
    if (onQueryChange) {
      onQueryChange(query);
    }

    const filtered = (items || []).filter(
      (item) => item.title?.toLowerCase().includes(query) || item.filename?.toLowerCase().includes(query) || item.cat?.toLowerCase().includes(query),
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

  return (
    <>
      <div ref={overlayRef} className={`${styles.overlay} ${isVisible ? styles.visible : ""}`}>
        {(lightboxImage && (
          <LightBoxImage
            onClick={() => setLightboxImage(null)}
            alt={lightboxImage.title}
            src={`assets/images/${lightboxImage.filename}`}
            className={lightBoxStyles.lightBoxImage}
            enableBlurEffect={false}
          />
        )) || (
          <div ref={contentRef} className={`${styles.content} ${isContentVisible ? styles.expanded : ""}`}>
            <div className={styles.header}>
              <div className={styles.searchInputContainer}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  ref={searchInputRef}
                  placeholder="Search for title or exhibition..."
                  className={styles.searchInput}
                  defaultValue={initialQuery}
                  disabled={isLoading}
                  onChange={(e) => handleFilter(e.target.value)}
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </div>

              <button onClick={handleClose} className={styles.closeButton}>
                <Cross1Icon />
              </button>
            </div>
            <div className={styles.results}>
              {isLoading ? (
                <div className={styles.spinner}>
                  <Spinner onClick={onClose} />
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  // Calculate animation delay based on scroll position and item index
                  const scrollFactor = Math.max(0, Math.min(1, (scrollPosition - index * 50) / 400));
                  const style = {
                    opacity: isContentVisible ? 1 : 0,
                    transform: `translateY(${scrollFactor * 10}px)`,
                    transition: `transform 0.3s ease, opacity 0.5s ease ${index * 0.1}s`,
                  };

                  return (
                    <div key={item.filename} className={styles.resultItem} onClick={() => setLightboxImage(item)} style={style}>
                      <img src={`assets/images/${item.filename}`} alt={item.title} className={styles.thumbnail} />
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemCat}>{item.cat}</span>
                    </div>
                  );
                })
              ) : (
                !isLoading && (
                  <div className={styles.noResults}>
                    <p>No results found {searchQuery ? `for "${searchQuery}"` : ""}</p>
                    <p>{items && items.length > 0 ? "Try different keywords or browse categories" : "No items available"}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
