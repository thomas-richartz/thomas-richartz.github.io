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

  const handleCancel = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setCurrentValue(value); // Revert changes
  };

  const handleSave = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue); // Save only if value changed
    }
  };

  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent propagation on long press
    longPressTimeout.current = setTimeout(() => {
      handleEditStart();
    }, 500); // Long press duration
  };

  const handleLongPressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent propagation on touch/mouse up
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Ensure change event doesn't propagate
    setCurrentValue(e.target.value);
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
            onChange={handleInputChange}
            autoFocus
          />
          <button
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </>
      ) : (
        <span
          className={styles.textDisplay}
        >
          {value}
        </span>
      )}
    </div>
  );
};
