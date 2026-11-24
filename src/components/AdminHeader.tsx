import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getInformation } from "../services/api";
import { Information } from "../types/types";
import { mediaUrl } from "../utils/content";
import { ministryName as getMinistryName } from "../utils/site";

/** Slim header for the administration area: logo, site name and user actions only. */
const AdminHeader: React.FC = () => {
  const [information, setInformation] = useState<Information | null>(null);
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "ar";

  useEffect(() => {
    getInformation()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
  }, []);

  const ministryName = getMinistryName(isArabic);
  const logoSource = mediaUrl(information?.logo);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const iconButton =
    "flex h-9 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors";

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className="sticky top-0 z-50 border-b-2 border-[#ce1f26] bg-gradient-to-l from-mauritania-green to-mauritania-green-dark text-white shadow-md"
    >
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/10">
            {logoSource ? (
              <img src={logoSource} alt={ministryName} className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true" className="text-[10px] font-semibold text-white/80">MO</span>
            )}
          </span>
          {ministryName && (
            <span className="hidden truncate text-sm font-bold md:block">{ministryName}</span>
          )}
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            title={isArabic ? "عرض الموقع" : "Voir le site"}
            className={`${iconButton} px-3 text-white/90 hover:bg-white/10 hover:text-white`}
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span className="hidden lg:inline">{isArabic ? "عرض الموقع" : "Voir le site"}</span>
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className={`${iconButton} border border-white/40 bg-white/10 px-4 hover:bg-white/20`}
          >
            {isArabic ? "Français" : "العربية"}
          </button>
          <Link
            to="/admin/dashboard"
            aria-label={isArabic ? "لوحة التحكم" : "Tableau de bord"}
            className={`${iconButton} w-9 bg-mauritania-gold text-mauritania-green-dark shadow hover:brightness-105`}
          >
            <FontAwesomeIcon icon={faUser} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title={isArabic ? "تسجيل الخروج" : "Déconnexion"}
            aria-label={isArabic ? "تسجيل الخروج" : "Déconnexion"}
            className={`${iconButton} w-9 border border-white/30 text-white/90 hover:bg-white/10 hover:text-mauritania-gold`}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className={isArabic ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
