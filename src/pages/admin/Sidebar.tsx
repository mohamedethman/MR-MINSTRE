import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useT } from "../../i18n";
import { ADMIN_SECTIONS, activeSectionPath } from "./adminSections";

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { t, language } = useT();
  const lang = language === "ar" ? "ar" : "fr";
  const active = activeSectionPath(pathname);

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-e border-gray-100 bg-white shadow-md">
      <div className="border-b p-6 text-2xl font-bold text-mauritania-green-dark">
        {t("لوحة الإدارة", "Administration")}
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {ADMIN_SECTIONS.map((section) => (
            <li key={section.to}>
              <Link
                to={section.to}
                aria-current={active === section.to ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-4 py-2.5 hover:bg-mauritania-green/10 ${
                  active === section.to
                    ? "bg-mauritania-green/20 font-semibold text-mauritania-green-dark"
                    : "text-gray-700"
                }`}
              >
                <FontAwesomeIcon icon={section.icon} fixedWidth />
                {section.label[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
