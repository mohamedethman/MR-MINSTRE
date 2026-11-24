import React from "react";
import { stripHtml } from "../utils/content";

interface CellTextProps {
  text?: string | null;
  /** Number of visible lines before the text is cut with "…" (default 2). */
  lines?: 1 | 2 | 3;
  dir?: "rtl" | "ltr";
  className?: string;
}

const clampClass = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const;

/**
 * Short preview of a long text inside a table cell or card: HTML is stripped,
 * the text is cut after a few lines, and the full text shows on hover.
 * Use it for every title/description column so rows keep a compact height.
 */
const CellText: React.FC<CellTextProps> = ({ text, lines = 2, dir, className = "" }) => {
  const plain = stripHtml(text);
  if (!plain) return <span className="text-gray-400">—</span>;
  return (
    <span
      dir={dir}
      title={plain}
      className={`block max-w-[22rem] break-words leading-6 ${clampClass[lines]} ${className}`}
    >
      {plain}
    </span>
  );
};

export default CellText;
