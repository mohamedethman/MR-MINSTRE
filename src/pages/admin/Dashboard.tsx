import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AdminLayout from "./AdminLayout";
import { ADMIN_SECTIONS } from "./adminSections";
import { useT } from "../../i18n";

const Dashboard: React.FC = () => {
  const { t, language } = useT();
  const lang = language === "ar" ? "ar" : "fr";
  const sections = ADMIN_SECTIONS.filter((section) => section.to !== "/admin/dashboard");

  return (
    <AdminLayout>
      <h1 className="mb-8 text-3xl font-bold text-mauritania-green-dark">
        {t("لوحة التحكم", "Tableau de bord")}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-lg bg-white p-6 shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${section.tone}`}>
                <FontAwesomeIcon icon={section.icon} size="2x" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800">{section.label[lang]}</h2>
                <p className="text-gray-600">{section.description[lang]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
