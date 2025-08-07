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
