export function convertMarkdownToHtml(mdText: string): string {
  if (!mdText) return "";

  // Replace bold with HTML strong tag
  mdText = mdText.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Replace italic with HTML em tag
  mdText = mdText.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  mdText = mdText.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Replace headings
  mdText = mdText.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  mdText = mdText.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  mdText = mdText.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Replace blockquotes
  mdText = mdText.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Replace lists
  mdText = mdText.replace(/^\* (.+)$/gm, "<li>$1</li>");
  mdText = mdText.replace(/^- (.+)$/gm, "<li>$1</li>");
  mdText = mdText.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");

  // Replace links
  mdText = mdText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Replace double line breaks with paragraphs
  mdText = mdText.replace(/\n\n/g, "</p><p>");

  // Wrap in paragraphs if not already contained in HTML elements
  if (!mdText.startsWith("<")) {
    mdText = `<p>${mdText}</p>`;
  }

  // Fix lists (wrap consecutive <li> elements in <ul>)
  mdText = mdText.replace(/(<li>.*?<\/li>)(?:\s*<li>)/g, "<ul>$1");
  mdText = mdText.replace(/(<\/li>)(?!\s*<li>)/g, "$1</ul>");

  // Clean up any empty paragraphs
  mdText = mdText.replace(/<p>\s*<\/p>/g, "");

  return mdText;
}

export function slugify(str: string): string {
  const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
