import React from "react";

interface SectionTitleProps {
  title: string;
  /** Optional element on the opposite side, e.g. a "See all" link. */
  action?: React.ReactNode;
  /** Use on dark (green) backgrounds. */
  light?: boolean;
  className?: string;
}

/**
 * Compact section heading shared by all pages: a short gold bar and the title,
 * aligned with the reading direction. Replaces the large centred headings with
 * an icon bubble and underline that took a lot of vertical space.
 */
const SectionTitle: React.FC<SectionTitleProps> = ({ title, action, light, className = "" }) => (
  <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${className}`}>
    <h2 className={`flex items-center gap-3 text-xl font-bold md:text-2xl ${light ? "text-white" : "text-mauritania-green-dark"}`}>
      <span aria-hidden="true" className="h-6 w-1.5 shrink-0 rounded-full bg-mauritania-gold" />
      {title}
    </h2>
    {action}
  </div>
);

export default SectionTitle;
