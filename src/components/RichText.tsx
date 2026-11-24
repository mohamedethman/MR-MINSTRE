import React, { useMemo } from "react";
import "react-quill/dist/quill.core.css";
import { isEmptyHtml, sanitizeHtml } from "../utils/content";

interface RichTextProps {
  html?: string | null;
  dir?: "rtl" | "ltr";
  className?: string;
}

/**
 * Displays HTML written in the admin rich-text editor (Quill) with the same
 * formatting the editor produced: paragraphs, headings, bold/italic, lists,
 * alignment, indentation, colours and links.
 */
const RichText: React.FC<RichTextProps> = ({ html, dir, className = "" }) => {
  const content = useMemo(() => (isEmptyHtml(html) ? "" : sanitizeHtml(html)), [html]);
  if (!content) return null;
  return (
    <div
      dir={dir}
      className={`ql-editor rich-text ${dir === "rtl" ? "rich-text-rtl" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichText;
