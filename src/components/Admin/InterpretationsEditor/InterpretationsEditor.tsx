import React, { useMemo, useState, useEffect } from "react";
import { CrudTable } from "@/components/Admin/CrudTable/CrudTable";
import { categoryInterpretations as initialCategoryInterpretations, imageInterpretations as initialImageInterpretations } from "@/assets/interpretations";
import { allImages } from "@/assets/assets";
import styles from "./InterpretationsEditor.module.css";

/**
 * Merges initial values with stored values from localStorage
 */
function mergeInitialWithStored<T extends Record<string, string>>(initial: T, stored: Record<string, string>): T {
  return Object.fromEntries(Object.entries(initial).map(([key, initialValue]) => [key, key in stored ? stored[key] : initialValue])) as T;
}

/**
 * InterpretationsEditor component for managing category and image interpretations
 * with markdown support
 */
export function InterpretationsEditor() {
  // Get stored interpretations from localStorage with fallback to empty object
  const storedImageInterpretations = JSON.parse(localStorage.getItem("imageInterpretations") ?? "{}") || {};
  const storedCategoryInterpretations = JSON.parse(localStorage.getItem("categoryInterpretations") ?? "{}") || {};

  // Initialize state with merged values from initial and stored data
  const [imageInterpretations, setImageInterpretations] = useState(() => mergeInitialWithStored(initialImageInterpretations, storedImageInterpretations));

  const [categoryInterpretations, setCategoryInterpretations] = useState(() =>
    mergeInitialWithStored(initialCategoryInterpretations, storedCategoryInterpretations),
  );

  // Save to localStorage when interpretations change
  useEffect(() => {
    localStorage.setItem("imageInterpretations", JSON.stringify(imageInterpretations));
  }, [imageInterpretations]);

  useEffect(() => {
    localStorage.setItem("categoryInterpretations", JSON.stringify(categoryInterpretations));
  }, [categoryInterpretations]);

  // Get all unique category and image keys
  const allCategoryKeys = useMemo(() => Array.from(new Set(allImages.map((img) => img.cat))), [allImages]);
  const allImageKeys = useMemo(() => allImages.map((img) => img.filename), [allImages]);

  return (
    <div className={styles.container}>
      <CrudTable title="Rubrik Interpretationen" data={categoryInterpretations} onDataChange={setCategoryInterpretations} possibleKeys={allCategoryKeys} />
      <CrudTable title="Image Interpretations" data={imageInterpretations} onDataChange={setImageInterpretations} possibleKeys={allImageKeys} />
    </div>
  );
}

// No default export
