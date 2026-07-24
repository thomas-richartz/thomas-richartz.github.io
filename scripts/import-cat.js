#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const INPUT_ROOT = path.join(ROOT, "input");
const OUTPUT_ROOT = path.join(ROOT, "public", "assets", "images");

const slugify = (text) =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const isImage = (file) => {
  const ext = path.extname(file).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"].includes(ext);
};

const extractYears = (name) => {
  const matches = name.match(/(19|20)\d{2}/g) || [];
  const years = matches.map(Number);
  if (years.length >= 2) return [years[0], years[years.length - 1]];
  if (years.length === 1) return [years[0]];
  return [];
};

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node scripts/import-category.js <input-folder-name>");
    process.exit(1);
  }

  const srcDir = path.join(INPUT_ROOT, arg);
  if (!fs.existsSync(srcDir) || !fs.lstatSync(srcDir).isDirectory()) {
    console.error(`Input folder not found: ${srcDir}`);
    process.exit(1);
  }

  const catOriginal = path.basename(arg);
  const catSlug = slugify(catOriginal);
  const outDir = path.join(OUTPUT_ROOT, catSlug);

  fs.mkdirSync(outDir, { recursive: true });

  const range = extractYears(catOriginal);
  const files = fs.readdirSync(srcDir).filter((f) => !f.startsWith("."));

  const jsonLines = [];

  for (const file of files) {
    if (!isImage(file)) continue;

    const srcFile = path.join(srcDir, file);
    if (!fs.lstatSync(srcFile).isFile()) continue;

    const base = path.parse(file).name;
    const title = base.replace(/[-_]+/g, " ").trim();
    const fileSlug = slugify(base);
    const outName = `${fileSlug}.webp`;
    const outFile = path.join(outDir, outName);

    await sharp(srcFile)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outFile);

    jsonLines.push({
      filename: `${catSlug}/${outName}`,
      title,
      cat: catOriginal,
      range,
    });
  }

  // Print as copy-paste object lines
  for (const row of jsonLines) {
    console.log(
      `{ filename: '${row.filename}', title: '${row.title.replace(/'/g, "\\'")}', cat: '${row.cat.replace(/'/g, "\\'")}', range: ${JSON.stringify(row.range)} },`
    );
  }

  console.log(`\nDone. Created ${jsonLines.length} image(s) in: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
