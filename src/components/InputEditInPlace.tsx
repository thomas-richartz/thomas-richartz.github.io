import React, { useState, useRef } from "react";
import styles from "./InputEditInPlace.module.css";

interface InputEditInPlaceProps {
  value: string;
  onSave: (newValue: string) => void;
}

export const InputEditInPlace: React.FC<InputEditInPlaceProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(value); // Revert changes
  };

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue); // Save only if value changed
    }
  };

  const handleLongPressStart = () => {
    longPressTimeout.current = setTimeout(() => {
      handleEditStart();
    }, 500); // Long press duration
  };

  const handleLongPressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  return (
    <div
      className={styles.editContainer}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      {isEditing ? (
        <>
          <input
            className={styles.editInput}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            autoFocus
          />
          <button className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
        </>
      ) : (
        <span
          className={styles.textDisplay}
          onClick={handleEditStart} // Allows click to edit as well
        >
          {value}
        </span>
      )}
    </div>
  );
};
