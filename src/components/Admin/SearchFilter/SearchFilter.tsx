import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import styles from "./SearchFilter.module.css";

interface SearchFilterProps {
  onFilterChange: (filteredKeys: string[]) => void;
  allKeys: string[];
  placeholder?: string;
}

/**
 * SearchFilter component for filtering keys in CrudTable
 * Provides search and filtering functionality
 */
export const SearchFilter = forwardRef<{ updateFilledKeys: (keys: string[]) => void }, SearchFilterProps>(
  ({ onFilterChange, allKeys, placeholder = "Search keys..." }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);
    const [showOnlyFilled, setShowOnlyFilled] = useState(false);
    const [filledKeys, setFilledKeys] = useState<string[]>([]);

    // Allow the component to receive information about which keys have content
    const updateFilledKeys = (keys: string[]) => {
      setFilledKeys(keys);
    };

    // Filter keys based on search term and filter options
    useEffect(() => {
      let filtered = [...allKeys];

      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter((key) => key.toLowerCase().includes(lowerSearchTerm));
      }

      // Apply empty/filled filters
      if (showOnlyEmpty && filledKeys.length) {
        filtered = filtered.filter((key) => !filledKeys.includes(key));
      }

      if (showOnlyFilled && filledKeys.length) {
        filtered = filtered.filter((key) => filledKeys.includes(key));
      }

      onFilterChange(filtered);
    }, [searchTerm, showOnlyEmpty, showOnlyFilled, allKeys, filledKeys, onFilterChange]);

    // Expose methods to parent component through ref
    useImperativeHandle(ref, () => ({
      updateFilledKeys,
    }));

    return (
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchInputWrapper}>
          <input type="text" className={styles.searchInput} placeholder={placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {searchTerm && (
            <button className={styles.clearButton} onClick={() => setSearchTerm("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className={styles.filterOptions}>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={showOnlyEmpty}
              onChange={() => {
                setShowOnlyEmpty(!showOnlyEmpty);
                if (!showOnlyEmpty && showOnlyFilled) {
                  setShowOnlyFilled(false);
                }
              }}
            />
            <span>Empty only</span>
          </label>

          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={showOnlyFilled}
              onChange={() => {
                setShowOnlyFilled(!showOnlyFilled);
                if (!showOnlyFilled && showOnlyEmpty) {
                  setShowOnlyEmpty(false);
                }
              }}
            />
            <span>Filled only</span>
          </label>
        </div>
      </div>
    );
  },
);

// Add a display name for debugging purposes
SearchFilter.displayName = "SearchFilter";
