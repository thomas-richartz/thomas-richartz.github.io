import React, { useState, useEffect, useRef, useMemo } from "react";
import { allImages } from "@/assets/assets";
import styles from "./ImageEditor.module.css";
import { Cross2Icon, MagnifyingGlassIcon, DownloadIcon, Pencil1Icon, CheckIcon, TrashIcon, ExitIcon, PlusIcon } from "@radix-ui/react-icons";
import { GalleryImage } from "@/types";

interface EditableImage extends GalleryImage {
  isEditing?: boolean;
  editedTitle?: string;
  editedCategory?: string;
  isKeyPiece?: boolean;
}

/**
 * Enhanced ImageEditor component for the admin panel
 * Provides comprehensive image management with advanced filtering, editing and export capabilities
 */
export function ImageEditor() {
  const [images, setImages] = useState<EditableImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<EditableImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<EditableImage | null>(null);
  const [editedImages, setEditedImages] = useState<Record<string, Partial<EditableImage>>>({});
  const [sortOption, setSortOption] = useState<"category" | "filename" | "title" | "date">("category");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images and saved edits on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load any previously saved edits from localStorage
        const savedEdits = JSON.parse(localStorage.getItem("imageEdits") || "{}");

        // Apply saved edits to images
        const processedImages = allImages.map((img) => {
          const savedEdit = savedEdits[img.filename];
          return {
            ...img,
            title: savedEdit?.title || img.title,
            cat: savedEdit?.category || img.cat,
            isKeyPiece: savedEdit?.isKeyPiece || img.keyPiece || false,
          };
        });

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(processedImages.map((img) => img.cat)));

        setImages(processedImages);
        setFilteredImages(processedImages);
        setCategories(uniqueCategories.sort());
        setEditedImages(savedEdits);

        // Check if there are unsaved changes
        setHasUnsavedChanges(Object.keys(savedEdits).length > 0);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Filter images based on search term and selected category
  useEffect(() => {
    let filtered = [...images];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (img) => img.title.toLowerCase().includes(term) || img.cat.toLowerCase().includes(term) || img.filename.toLowerCase().includes(term),
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((img) => img.cat === selectedCategory);
    }

    // Apply sorting
    switch (sortOption) {
      case "category":
        filtered.sort((a, b) => a.cat.localeCompare(b.cat));
        break;
      case "filename":
        filtered.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "date":
        filtered.sort((a, b) => {
          const aYear = a.range[0] || 0;
          const bYear = b.range[0] || 0;
          return bYear - aYear; // Most recent first
        });
        break;
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedCategory, sortOption]);

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Start editing an image
  const startEditing = (image: EditableImage) => {
    setActiveImage({
      ...image,
      isEditing: true,
      editedTitle: image.title,
      editedCategory: image.cat,
    });
  };

  // Cancel editing and discard changes
  const cancelEditing = () => {
    setActiveImage(null);
  };

  // Save changes to an image
  const saveImageChanges = () => {
    if (!activeImage) return;

    const { filename, editedTitle, editedCategory, isKeyPiece } = activeImage;

    // Update the image in the list
    const updatedImages = images.map((img) =>
      img.filename === filename
        ? {
            ...img,
            title: editedTitle || img.title,
            cat: editedCategory || img.cat,
            isKeyPiece: isKeyPiece || false,
          }
        : img,
    );

    // Store the changes
    const updatedEdits = {
      ...editedImages,
      [filename]: {
        title: editedTitle,
        category: editedCategory,
        isKeyPiece: isKeyPiece || false,
      },
    };

    // Save to localStorage
    localStorage.setItem("imageEdits", JSON.stringify(updatedEdits));

    // Update state
    setImages(updatedImages);
    setEditedImages(updatedEdits);
    setActiveImage(null);
    setHasUnsavedChanges(true);

    // Update categories if needed
    if (editedCategory && !categories.includes(editedCategory)) {
      setCategories([...categories, editedCategory].sort());
    }
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeImage) return;
    setActiveImage({
      ...activeImage,
      editedTitle: e.target.value,
    });
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeImage) return;
    setActiveImage({
      ...activeImage,
      editedCategory: e.target.value,
    });
  };

  // Toggle key piece status
  const toggleKeyPiece = () => {
    if (!activeImage) return;
    setActiveImage({
      ...activeImage,
      isKeyPiece: !activeImage.isKeyPiece,
    });
  };

  // Export edited images data
  const exportImageData = () => {
    // Create a copy of the images with applied edits
    const exportData = images.map((img) => ({
      filename: img.filename,
      title: img.title,
      cat: img.cat,
      range: img.range,
      keyPiece: img.isKeyPiece || false,
    }));

    // Convert to JSON and create downloadable blob
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger it
    const link = document.createElement("a");
    link.href = url;
    link.download = "gallery_images.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle file upload for new images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Here you would implement file upload logic
    // For now, we'll just show a demo alert
    alert(`${files.length} file(s) selected for upload. This feature would upload the files to your server.`);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Calculate stats for the image collection
  const stats = useMemo(() => {
    return {
      total: images.length,
      filtered: filteredImages.length,
      categories: categories.length,
      keyPieces: images.filter((img) => img.isKeyPiece).length,
    };
  }, [images, filteredImages, categories]);

  // Render the image detail/edit view
  const renderImageDetail = () => {
    if (!activeImage) return null;

    return (
      <div className={styles.imageDetailOverlay}>
        <div className={styles.imageDetailContent}>
          <div className={styles.imageDetailHeader}>
            <h3>{activeImage.isEditing ? "Edit Image" : "Image Details"}</h3>
            <button className={styles.closeButton} onClick={cancelEditing} aria-label="Close">
              <Cross2Icon />
            </button>
          </div>

          <div className={styles.imageDetailBody}>
            <div className={styles.imagePreviewContainer}>
              <img src={`assets/images/${activeImage.filename}`} alt={activeImage.title} className={styles.imagePreview} />
              <div className={styles.imageFilename}>{activeImage.filename}</div>
            </div>

            <div className={styles.imageDetailForm}>
              {activeImage.isEditing ? (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="imageTitle">Title</label>
                    <input id="imageTitle" type="text" value={activeImage.editedTitle || ""} onChange={handleTitleChange} className={styles.formInput} />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="imageCategory">Category</label>
                    <input
                      id="imageCategory"
                      type="text"
                      value={activeImage.editedCategory || ""}
                      onChange={handleCategoryChange}
                      className={styles.formInput}
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="imageKeyPiece" className={styles.checkboxLabel}>
                      <input
                        id="imageKeyPiece"
                        type="checkbox"
                        checked={activeImage.isKeyPiece || false}
                        onChange={toggleKeyPiece}
                        className={styles.checkbox}
                      />
                      <span>Key Piece</span>
                    </label>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button className={`${styles.button} ${styles.primaryButton}`} onClick={saveImageChanges}>
                      <CheckIcon /> Save Changes
                    </button>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={cancelEditing}>
                      <ExitIcon /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Title:</span>
                    <span className={styles.detailValue}>{activeImage.title}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Category:</span>
                    <span className={styles.detailValue}>{activeImage.cat}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Year:</span>
                    <span className={styles.detailValue}>{activeImage.range.join(", ")}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Key Piece:</span>
                    <span className={styles.detailValue}>{activeImage.isKeyPiece ? "Yes" : "No"}</span>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => startEditing(activeImage)}>
                      <Pencil1Icon /> Edit
                    </button>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={cancelEditing}>
                      <ExitIcon /> Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <MagnifyingGlassIcon className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search images by title, category or filename..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} className={styles.clearSearchButton}>
              <Cross2Icon />
            </button>
          )}
        </div>

        <div className={styles.toolbarActions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === "grid" ? styles.activeView : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
            >
              Grid
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === "list" ? styles.activeView : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List View"
            >
              List
            </button>
          </div>

          <div className={styles.sortContainer}>
            <label htmlFor="sortOption">Sort by:</label>
            <select id="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value as any)} className={styles.sortSelect}>
              <option value="category">Category</option>
              <option value="title">Title</option>
              <option value="filename">Filename</option>
              <option value="date">Date</option>
            </select>
          </div>

          {hasUnsavedChanges && (
            <button onClick={exportImageData} className={`${styles.button} ${styles.exportButton}`} title="Export Changes">
              <DownloadIcon /> Export
            </button>
          )}

          <button onClick={() => fileInputRef.current?.click()} className={`${styles.button} ${styles.uploadButton}`} title="Upload New Images">
            <PlusIcon /> Upload
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sidebar}>
          <div className={styles.categoryHeader}>
            <h3>Categories</h3>
          </div>
          <div className={styles.categoryList}>
            <button className={`${styles.categoryItem} ${selectedCategory === null ? styles.activeCategory : ""}`} onClick={() => handleCategorySelect(null)}>
              All Categories ({stats.total})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryItem} ${selectedCategory === category ? styles.activeCategory : ""}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category} ({images.filter((img) => img.cat === category).length})
              </button>
            ))}
          </div>

          <div className={styles.statsContainer}>
            <h3>Stats</h3>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Images:</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Categories:</span>
              <span className={styles.statValue}>{stats.categories}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Key Pieces:</span>
              <span className={styles.statValue}>{stats.keyPieces}</span>
            </div>
            {searchTerm || selectedCategory ? (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Filtered:</span>
                <span className={styles.statValue}>{stats.filtered}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.mainContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading images...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className={styles.noResults}>
              <p>No images found matching your criteria</p>
              {(searchTerm || selectedCategory) && (
                <button
                  className={styles.button}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className={`${styles.imageGrid} ${viewMode === "list" ? styles.listView : ""}`}>
              {filteredImages.map((image) => (
                <div key={image.filename} className={`${styles.imageCard} ${image.isKeyPiece ? styles.keyPiece : ""}`} onClick={() => setActiveImage(image)}>
                  <div className={styles.imageContainer}>
                    <img src={`assets/images/${image.filename}`} alt={image.title} className={styles.imageThumb} />
                    {image.isKeyPiece && <span className={styles.keyPieceBadge}>★</span>}
                  </div>
                  <div className={styles.imageInfo}>
                    <h4 className={styles.imageTitle}>{image.title}</h4>
                    <div className={styles.imageMetaData}>
                      <span className={styles.imageCategory}>{image.cat}</span>
                      {viewMode === "list" && (
                        <>
                          <span className={styles.imageDivider}>•</span>
                          <span className={styles.imageFilename}>{image.filename.split("/").pop()}</span>
                        </>
                      )}
                    </div>
                    {viewMode === "list" && (
                      <div className={styles.listActions}>
                        <button
                          className={`${styles.button} ${styles.editButton}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(image);
                          }}
                        >
                          <Pencil1Icon /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeImage && renderImageDetail()}
    </div>
  );
}

// No default export
