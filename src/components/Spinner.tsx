import React from "react";
import { useT } from "../i18n";

interface SpinnerProps {
  /** Text under the spinner; defaults to "Loading…" in the current language. */
  label?: string;
  /** "page" fills the visible area below the header; "section" is a compact block. */
  variant?: "page" | "section";
  className?: string;
}

/** Ministry-coloured loading spinner (green ring with a gold arc). */
const Spinner: React.FC<SpinnerProps> = ({ label, variant = "section", className = "" }) => {
  const { t } = useT();
  const text = label ?? t("جاري التحميل...", "Chargement…");
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 text-mauritania-green-dark ${
        variant === "page" ? "min-h-[60vh]" : "py-12"
      } ${className}`}
    >
      <span className="relative flex h-14 w-14">
        <span className="absolute inset-0 rounded-full border-4 border-mauritania-green/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-mauritania-gold border-r-mauritania-green" />
        <span className="absolute inset-[18px] rounded-full bg-mauritania-green/10" />
      </span>
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
};

export default Spinner;
