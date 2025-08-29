import React, { useState } from "react";
import { exportJSON, exportCSV } from "@/utils/exporters";
import styles from "./CrudTable.module.css";
import Markdown from "@/components/Markdown";

type InterpretationData = Record<string, string>;

interface CrudTableProps {
  title: string;
  data: InterpretationData;
  possibleKeys: string[];
  onDataChange: (data: InterpretationData) => void;
}

export const CrudTable: React.FC<CrudTableProps> = ({ title, data, possibleKeys, onDataChange }) => {
  // Track which key is being edited or added
  const [activeEditKey, setActiveEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const usedKeys = Object.keys(data);
  const unusedKeys = possibleKeys.filter((key) => !usedKeys.includes(key));

  // If a new key is being added, it's set as activeEditKey, but not yet in data
  const startEdit = (key: string, initialValue: string = "") => {
    setActiveEditKey(key);
    setEditValue(initialValue);
  };

  const handleSave = (key: string) => {
    if (editValue.trim() !== "") {
      onDataChange({ ...data, [key]: editValue });
      setActiveEditKey(null);
      setEditValue("");
    }
  };

  const handleCancel = () => {
    setActiveEditKey(null);
    setEditValue("");
  };

  const handleDelete = (key: string) => {
    const { [key]: _, ...rest } = data;
    onDataChange(rest);
  };

  // Render all keys (used first, then unused)
  return (
    <div className={styles.crudTable}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.markdownInfo}>
        <p>
          Markdown supported: <code>**bold**</code>, <code>*italic*</code>, <code># Heading</code>, <code>- List items</code>, <code>[Link](url)</code>
        </p>
      </div>
      <div className={styles.exportButtons}>
        <button className={styles.exportButton} onClick={() => exportJSON(data, `${title}.json`)}>
          Export JSON
        </button>
        <button className={styles.exportButton} onClick={() => exportCSV(data, `${title}.csv`)}>
          Export CSV
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Key</th>
            <th className={styles.th}>Interpretation</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...usedKeys, ...unusedKeys].map((key) => (
            <tr key={key} className={activeEditKey === key ? styles.activeRow : ""}>
              <td className={styles.td}>{key}</td>
              <td className={styles.td}>
                {activeEditKey === key ? (
                  <textarea
                    className={styles.textarea}
                    value={editValue}
                    placeholder="Enter interpretation..."
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={12}
                    autoFocus
                  />
                ) : data[key] ? (
                  <Markdown content={data[key]} />
                ) : (
                  <span className={styles.placeholder}>(none)</span>
                )}
              </td>
              <td className={styles.td}>
                {activeEditKey === key ? (
                  <>
                    <button className={styles.button} onClick={() => handleSave(key)}>
                      Save
                    </button>
                    <button className={styles.button} onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : data[key] ? (
                  <>
                    <button className={styles.button} onClick={() => startEdit(key, data[key])}>
                      Edit
                    </button>
                    {/*<button className={styles.button} onClick={() => handleDelete(key)}>
                      Delete
                    </button>*/}
                  </>
                ) : (
                  <button className={styles.button} onClick={() => startEdit(key, "")}>
                    Add
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
