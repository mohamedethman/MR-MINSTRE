import React from "react";
import { Link } from "react-router-dom";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useT } from "../i18n";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconDefinition;
  /** Links shown before the title in the breadcrumb ("Accueil" is always first). */
  crumbs?: Crumb[];
  /** Optional buttons on the opposite side (e.g. "Back"). */
  actions?: React.ReactNode;
}

/**
 * Compact page title used by every public page: breadcrumb, title and a short
 * subtitle in ~120px, so the page content starts near the top of the screen.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, crumbs = [], actions }) => {
  const { t, dir } = useT();
  return (
    <section dir={dir} className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <nav aria-label={t("مسار التصفح", "Fil d'Ariane")} className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 md:text-sm">
          <Link to="/" className="hover:text-mauritania-green">
            {t("الرئيسية", "Accueil")}
          </Link>
          {crumbs.map((crumb) => (
            <React.Fragment key={crumb.label}>
              <span aria-hidden="true">/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-mauritania-green">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 font-medium text-gray-700" aria-current="page">
            {title}
          </span>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-mauritania-green-dark md:text-3xl">
              <span aria-hidden="true" className="h-7 w-1.5 shrink-0 rounded-full bg-mauritania-gold md:h-8" />
              {icon && <FontAwesomeIcon icon={icon} className="text-xl text-mauritania-green md:text-2xl" />}
              <span className="min-w-0">{title}</span>
            </h1>
            {subtitle && <p className="mt-1 max-w-3xl text-sm text-gray-600 md:text-base">{subtitle}</p>}
          </div>
          {actions}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
