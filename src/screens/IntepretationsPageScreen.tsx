import React, { useMemo, useState, useEffect } from "react";
import { CrudTable } from "@/components/CrudTable";
import { categoryInterpretations as initialCategoryInterpretations, imageInterpretations as initialImageInterpretations } from "@/assets/interpretations";
import { allImages } from "@/assets/assets";
import { CrossCircledIcon } from "@radix-ui/react-icons";

// type InterpretationsPageScreenProps = {
//   onClose: () => void;
// };

function mergeInitialWithStored<T extends Record<string, string>>(initial: T, stored: Record<string, string>): T {
  return Object.fromEntries(Object.entries(initial).map(([key, initialValue]) => [key, key in stored ? stored[key] : initialValue])) as T;
}

export function InterpretationsPageScreen() {
  // const storedImageInterpretations = JSON.parse(localStorage.getItem("imageInterpretations")) || {};
  // const storedCategoryInterpretations = JSON.parse(localStorage.getItem("categoryInterpretations")) || {};

  const storedImageInterpretations = JSON.parse(localStorage.getItem("imageInterpretations") ?? "{}") || {};
  const storedCategoryInterpretations = JSON.parse(localStorage.getItem("categoryInterpretations") ?? "{}") || {};

  const [imageInterpretations, setImageInterpretations] = useState(() => mergeInitialWithStored(initialImageInterpretations, storedImageInterpretations));
  const [categoryInterpretations, setCategoryInterpretations] = useState(() =>
    mergeInitialWithStored(initialCategoryInterpretations, storedCategoryInterpretations),
  );

  useEffect(() => {
    localStorage.setItem("imageInterpretations", JSON.stringify(imageInterpretations));
  }, [imageInterpretations]);

  useEffect(() => {
    localStorage.setItem("categoryInterpretations", JSON.stringify(categoryInterpretations));
  }, [categoryInterpretations]);

  const allCategoryKeys = useMemo(() => Array.from(new Set(allImages.map((img) => img.cat))), [allImages]);
  const allImageKeys = useMemo(() => allImages.map((img) => img.filename), [allImages]);

  return (
    <div style={{ padding: 10 }}>
      <CrudTable title="Rubrik Interpretationen" data={categoryInterpretations} onDataChange={setCategoryInterpretations} possibleKeys={allCategoryKeys} />
      <CrudTable title="Image Interpretations" data={imageInterpretations} onDataChange={setImageInterpretations} possibleKeys={allImageKeys} />
    </div>
  );
}
