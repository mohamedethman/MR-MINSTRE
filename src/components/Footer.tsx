import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "../context/LanguageContext";
import { getInformation } from "../services/api";
import { Information } from "../types/types";

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [information, setInformation] = useState<Information | null>(null);

  useEffect(() => {
    getInformation()
      .then((response) => {
        if (response.data?.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
  }, []);

  const ministryName = isArabic
    ? "وزارة العقارات وأملاك الدولة والإصلاح العقاري"
    : "Ministère des Domaines, du Patrimoine de l’État et de la Réforme foncière";
  const republicName = isArabic
    ? "الجمهورية الإسلامية الموريتانية"
    : "République Islamique de Mauritanie";
  const logoSource = information?.logo
    ? information.logo.startsWith("data:")
      ? information.logo
      : `data:image/jpeg;base64,${information.logo}`
    : null;

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-8 py-6 md:flex-row">
        <div className="flex items-center gap-4">
          {logoSource ? (
            <img
              src={logoSource}
              alt={isArabic ? "شعار الوزارة" : "Logo du ministère"}
              className="h-12 w-12 shrink-0 rounded-full border border-gray-300 object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-mauritania-green text-sm font-bold text-white"
            >
              {isArabic ? "م" : "MO"}
            </span>
          )}
          <div className={isArabic ? "text-right" : "text-left"}>
            <p className="text-xs font-semibold leading-tight text-gray-600">{republicName}</p>
            <h2 className="mt-1 text-sm font-bold text-gray-800 md:text-base">{ministryName}</h2>
          </div>
        </div>

        <nav
          aria-label={isArabic ? "روابط سريعة" : "Liens rapides"}
          className="flex items-center gap-6 text-sm font-medium"
        >
          <Link to="/" className="transition-colors hover:text-[#ce1f26]">
            {isArabic ? "الرئيسية" : "Accueil"}
          </Link>
          <Link to="/contact" className="transition-colors hover:text-[#ce1f26]">
            {isArabic ? "اتصل بنا" : "Contact"}
          </Link>
          <a
            href="https://web.facebook.com/profile.php?id=100092540392286"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
        </nav>
      </div>

      <div className="space-y-1 border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} {ministryName} - {republicName}</p>
        <p>{isArabic ? "إصدار المشروع" : "Version du projet"} v1.0 - 30-04-2026</p>
      </div>
    </footer>
  );
};

export default Footer;
