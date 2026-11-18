import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getInformation } from "../services/api";
import { Information } from "../types/types";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [information, setInformation] = useState<Information | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isArabic = language === "ar";

  useEffect(() => {
    getInformation()
      .then((response) => {
        if (response.data?.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    const updateHeaderSize = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        setIsCompact(window.scrollY > 48);
        animationFrame = 0;
      });
    };

    updateHeaderSize();
    window.addEventListener("scroll", updateHeaderSize, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateHeaderSize);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const ministryName = isArabic
    ? "وزارة العقارات وأملاك الدولة والإصلاح العقاري"
    : "Ministère des Domaines, du Patrimoine de l’État et de la Réforme foncière";
  const republicName = isArabic
    ? "الجمهورية الإسلامية الموريتانية"
    : "République Islamique de Mauritanie";
  const labels = isArabic
    ? ["الرئيسية", "الأخبار", "الوزارة", "المشاريع", "الإجراءات والخدمات", "إعلانات", "تواصل معنا"]
    : ["Accueil", "Actualités", "Le ministère", "Projets", "Procédures et services", "Annonces", "Contact"];
  const paths = ["/", "/news", "/ministry", "/projects", "/procedures", "/announcements", "/contact"];
  const logoSource = information?.logo
    ? information.logo.startsWith("data:")
      ? information.logo
      : `data:image/jpeg;base64,${information.logo}`
    : null;

  const closeMenu = () => setMenuOpen(false);
  const active = (path: string) => {
    const pagePath = path.split("#")[0];
    const hash = path.split("#")[1];
    if (location.pathname === pagePath) {
      return hash ? location.hash === `#${hash}` : !location.hash;
    }
    return !hash && pagePath === "/news" && location.pathname.startsWith("/news/");
  };
  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenu();
  };
  const logo = (size: "desktop" | "mobile") => {
    const dimensions = size === "desktop"
      ? (isCompact ? "h-14 w-14" : "h-20 w-20")
      : (isCompact ? "h-12 w-12" : "h-16 w-16");
    return logoSource ? (
      <img
        src={logoSource}
        alt={isArabic ? "شعار الوزارة" : "Logo du ministère"}
        className={`${dimensions} shrink-0 rounded-full border-2 border-white/30 object-cover shadow-md transition-all duration-300 ease-in-out`}
      />
    ) : (
      <span
        aria-hidden="true"
        className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-xl font-bold text-mauritania-gold shadow-md transition-all duration-300 ease-in-out`}
      >
        م
      </span>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 border-[#ce1f26] bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white shadow-custom transition-[border-width,box-shadow] duration-300 ease-in-out ${isCompact ? "border-b-2" : "border-b-4"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="hidden border-b border-white/20 md:block">
        <div className={`container mx-auto flex items-center justify-between px-6 transition-[padding] duration-300 ease-in-out ${isCompact ? "gap-3 py-1.5" : "gap-4 py-3"}`}>
          <Link to="/" className="flex min-w-0 items-center gap-4">
            {logo("desktop")}
            <div className={isArabic ? "text-right" : "text-left"}>
              <p className={`overflow-hidden text-sm font-semibold text-white/90 transition-[max-height,opacity,margin] duration-300 ease-in-out ${isCompact ? "mb-0 max-h-0 opacity-0" : "max-h-6 opacity-100"}`}>{republicName}</p>
              <h1 className={`font-bold leading-snug transition-[font-size,margin] duration-300 ease-in-out ${isCompact ? "mt-0 text-lg" : "mt-1 text-xl"}`}>
                {information?.nomsite || ministryName}
              </h1>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-4">
            <Link
              to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
              aria-label={isArabic ? "لوحة التحكم" : "Espace administration"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              <FontAwesomeIcon icon={faUser} className="text-lg" />
            </Link>
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={isArabic ? "Switch to French" : "Passer en arabe"}
              className="flex min-w-[120px] items-center justify-center rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 transition-colors hover:border-white/50 hover:bg-white/20"
            >
              <span className="text-sm font-semibold tracking-wide">
                {isArabic ? "Français" : "العربية"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={`container mx-auto flex items-center justify-between gap-4 px-4 transition-[padding] duration-300 ease-in-out md:hidden ${isCompact ? "py-2" : "py-4"}`}>
        <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-3">
          {logo("mobile")}
          <div className={isArabic ? "text-right" : "text-left"}>
            <p className={`overflow-hidden text-xs font-semibold leading-tight text-white/90 transition-[max-height,opacity] duration-300 ease-in-out ${isCompact ? "max-h-0 opacity-0" : "max-h-5 opacity-100"}`}>{republicName}</p>
            <h1 className={`font-bold leading-tight transition-[font-size,margin] duration-300 ease-in-out ${isCompact ? "mt-0 text-sm" : "mt-1 text-base"}`}>
              {information?.nomsite || ministryName}
            </h1>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            aria-label={isArabic ? "لوحة التحكم" : "Espace administration"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <FontAwesomeIcon icon={faUser} />
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={isArabic ? "Switch to French" : "Passer en arabe"}
            className="rounded-full border-2 border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/20"
          >
            {isArabic ? "FR" : "AR"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? (isArabic ? "إغلاق القائمة" : "Fermer le menu") : (isArabic ? "فتح القائمة" : "Ouvrir le menu")}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-white/10"
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>

      <nav aria-label={isArabic ? "التنقل الرئيسي" : "Navigation principale"}>
        <div className="container mx-auto px-4 md:px-6">
          <ul className={`${menuOpen ? "flex" : "hidden"} flex-col transition-[padding] duration-300 ease-in-out ${isCompact ? "py-1" : "py-2"} md:flex md:flex-row md:items-stretch md:justify-center md:py-0`}>
            {labels.map((label, index) => (
              <li key={paths[index]}>
                <Link
                  to={paths[index]}
                  onClick={closeMenu}
                  aria-current={active(paths[index]) ? "page" : undefined}
                  className={`block border-b-2 px-4 text-sm font-semibold transition-[padding,color,border-color] duration-300 ${isCompact ? "py-2 md:py-2" : "py-3 md:py-4"} ${
                    active(paths[index])
                      ? "border-mauritania-gold text-mauritania-gold"
                      : "border-transparent text-white hover:text-mauritania-gold"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-3 text-start text-sm text-white/80 hover:text-mauritania-gold md:py-4"
                >
                  {isArabic ? "تسجيل الخروج" : "Déconnexion"}
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-sm text-white/80 hover:text-mauritania-gold md:py-4"
                >
                  {isArabic ? "لوحة التحكم" : "Administration"}
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
