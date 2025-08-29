import React from "react";
import { convertMarkdownToHtml } from "@/utils/textUtils";
import styles from "./Markdown.module.css";

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * A component for rendering Markdown content consistently across the application
 */
export const Markdown: React.FC<MarkdownProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Escape HTML before converting markdown to prevent injection attacks
  const escapedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = convertMarkdownToHtml(escapedContent);

  return <div className={`${styles.markdown} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default Markdown;
