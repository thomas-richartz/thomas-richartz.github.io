import React, { useState, useEffect, useRef } from "react";
import { exportJSON, exportCSV } from "@/utils/exporters";
import Markdown from "@/components/Markdown";
import { SearchFilter } from "../SearchFilter/SearchFilter";
import styles from "./CrudTable.module.css";

type InterpretationData = Record<string, string>;

interface CrudTableProps {
  title: string;
  data: InterpretationData;
  possibleKeys: string[];
  onDataChange: (data: InterpretationData) => void;
}

const AUTO_SAVE_DELAY = 2000; // milliseconds

export function CrudTable({ title, data, possibleKeys, onDataChange }: CrudTableProps) {
  // Track which key is being edited or added
  const [activeEditKey, setActiveEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [tempSavedValue, setTempSavedValue] = useState<string | null>(null);
  const [filteredKeys, setFilteredKeys] = useState<string[]>(possibleKeys);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const searchFilterRef = useRef<any>(null);

  // Auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const usedKeys = Object.keys(data);
  const unusedKeys = possibleKeys.filter((key) => !usedKeys.includes(key));

  // Update SearchFilter with filled keys information
  useEffect(() => {
    if (searchFilterRef.current) {
      searchFilterRef.current.updateFilledKeys(usedKeys);
    }
  }, [usedKeys]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Setup auto-save for the current edit
  useEffect(() => {
    if (activeEditKey && editValue.trim() !== "") {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Store temporary backup in localStorage
      const tempKey = `temp_${title}_${activeEditKey}`;
      localStorage.setItem(tempKey, editValue);
      setTempSavedValue(editValue);

      // Set up auto-save timer
      autoSaveTimerRef.current = setTimeout(() => {
        setSaveStatus("saving");

        // Save to localStorage after a delay to simulate network activity
        setTimeout(() => {
          onDataChange({ ...data, [activeEditKey]: editValue });
          setSaveStatus("saved");

          // Clear the temp backup after successful save
          setTimeout(() => {
            setSaveStatus("idle");
          }, 1500);
        }, 300);
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editValue, activeEditKey, data, onDataChange, title]);

  // Check for unsaved drafts when starting to edit
  const startEdit = (key: string, initialValue: string = "") => {
    const tempKey = `temp_${title}_${key}`;
    const savedDraft = localStorage.getItem(tempKey);

    if (savedDraft && savedDraft !== initialValue) {
      const confirmRestore = window.confirm("We found an unsaved draft. Would you like to restore it?");

      if (confirmRestore) {
        setEditValue(savedDraft);
      } else {
        setEditValue(initialValue);
        localStorage.removeItem(tempKey);
      }
    } else {
      setEditValue(initialValue);
    }

    setActiveEditKey(key);
    setSaveStatus("idle");
  };

  const handleSave = (key: string) => {
    if (editValue.trim() !== "") {
      // Clear any pending auto-save
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      // Update the data
      onDataChange({ ...data, [key]: editValue });

      // Clear the temporary saved value
      const tempKey = `temp_${title}_${key}`;
      localStorage.removeItem(tempKey);

      // Reset the editor state
      setActiveEditKey(null);
      setEditValue("");
      setTempSavedValue(null);
      setSaveStatus("idle");
    }
  };

  const handleCancel = () => {
    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // If we have a temp saved value and user tries to cancel, confirm
    if (tempSavedValue && editValue !== data[activeEditKey!]) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to discard them?");

      if (!confirmCancel) {
        return;
      }
    }

    // Clear the temporary saved value
    if (activeEditKey) {
      const tempKey = `temp_${title}_${activeEditKey}`;
      localStorage.removeItem(tempKey);
    }

    // Reset the editor state
    setActiveEditKey(null);
    setEditValue("");
    setTempSavedValue(null);
    setSaveStatus("idle");
  };

  const handleDelete = (key: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry? This action cannot be undone.");

    if (confirmDelete) {
      const { [key]: _, ...rest } = data;
      onDataChange(rest);
    }
  };

  const handleFilterChange = (filtered: string[]) => {
    setFilteredKeys(filtered);
  };

  // Combine and filter the keys for rendering
  const keysToRender = [...usedKeys, ...unusedKeys].filter((key) => filteredKeys.includes(key));

  return (
    <div className={styles.crudTable}>
      <h2 className={styles.heading}>{title}</h2>

      <div className={styles.markdownInfo}>
        <p>
          Markdown supported: <code>**bold**</code>, <code>*italic*</code>, <code># Heading</code>, <code>- List items</code>, <code>[Link](url)</code>
        </p>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.exportButtons}>
          <button className={styles.exportButton} onClick={() => exportJSON(data, `${title}.json`)}>
            Export JSON
          </button>
          <button className={styles.exportButton} onClick={() => exportCSV(data, `${title}.csv`)}>
            Export CSV
          </button>
        </div>

        <div className={styles.dataStats}>
          <span>
            {usedKeys.length} of {possibleKeys.length} items filled
          </span>
        </div>
      </div>

      <SearchFilter ref={searchFilterRef} onFilterChange={handleFilterChange} allKeys={possibleKeys} placeholder={`Search ${title}...`} />

      {keysToRender.length === 0 ? (
        <div className={styles.noResults}>No items match your filter criteria</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Key</th>
                <th className={styles.th}>Interpretation</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keysToRender.map((key) =>
                activeEditKey === key ? (
                  <tr key={key} className={styles.activeRow}>
                    <td colSpan={3} className={styles.tdFullWidth}>
                      <div className={styles.editHeader}>
                        <div className={styles.editKeyInfo}>
                          Editing: <strong>{key}</strong>
                        </div>
                        <div className={styles.actionButtons}>
                          <button className={`${styles.button} ${styles.saveButton}`} onClick={() => handleSave(key)}>
                            Save
                          </button>
                          <button className={`${styles.button} ${styles.cancelButton}`} onClick={handleCancel}>
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className={styles.editContainer}>
                        <textarea
                          className={styles.textarea}
                          value={editValue}
                          placeholder="Enter interpretation..."
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={15}
                          autoFocus
                        />
                        <div className={styles.saveStatus}>
                          {saveStatus === "saving" && <span>Saving...</span>}
                          {saveStatus === "saved" && <span>Draft saved</span>}
                          {tempSavedValue && saveStatus === "idle" && <span>Draft stored</span>}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={key}>
                    <td className={styles.td}>{key}</td>
                    <td className={styles.td}>{data[key] ? <Markdown content={data[key]} /> : <span className={styles.placeholder}>(none)</span>}</td>
                    <td className={styles.tdActions}>
                      {data[key] ? (
                        <div className={styles.actionButtons}>
                          <button className={`${styles.button} ${styles.editButton}`} onClick={() => startEdit(key, data[key])}>
                            Edit
                          </button>
                          <button className={`${styles.button} ${styles.deleteButton}`} onClick={() => handleDelete(key)}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className={styles.actionButtons}>
                          <button className={`${styles.button} ${styles.addButton}`} onClick={() => startEdit(key, "")}>
                            Add
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
