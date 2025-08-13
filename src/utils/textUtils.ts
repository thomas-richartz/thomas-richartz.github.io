export function convertMarkdownToHtml(mdText: string): string {
  // Replace bold with HTML strong tag
  mdText = mdText.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  // Replace single quotes (>) as blockquotes
  mdText = mdText.replace(/> ([^\n]+)/g, "<blockquote>$1</blockquote>");
  // Replace double line breaks and two spaces with <br />
  mdText = mdText.replace(/\n{2}/g, "<br /><br />");
  mdText = mdText.replace(/\s{2}/g, "<br />");

  return mdText;
}

export function slugify(str) {
  const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/^-+|-+$/g, "");
}

// export function slugifyUrl(path, title) {
//   const slug = slugify(title);
//   return `${path}/${slug}`;
// }
