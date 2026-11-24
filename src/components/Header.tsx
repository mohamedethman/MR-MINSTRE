import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightFromBracket, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getInformation } from "../services/api";
import { Information } from "../types/types";
import { mediaUrl } from "../utils/content";
import { ministryName as getMinistryName } from "../utils/site";

/*
 * Shrinking the sticky header moves the page content up by its height change
 * (~90px), and the browser compensates the scroll position by the same amount.
 * With a single threshold that flips the header straight back — the "vibration".
 * Two thresholds whose gap is larger than that height change, plus a short lock
 * while the size animates, keep each state stable.
 */
const COMPACT_AFTER = 140; // px scrolled before the header shrinks
const EXPAND_BEFORE = 8; // px from the top before it grows again
const TRANSITION_LOCK_MS = 350; // matches the 300ms size transition

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
        if (Array.isArray(response.data) && response.data.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let frame = 0;
    let compact = window.scrollY > COMPACT_AFTER;
    let lockedUntil = 0;
    setIsCompact(compact);

    const update = () => {
      frame = 0;
      if (performance.now() < lockedUntil) return;
      const y = window.scrollY;
      const next = compact ? y > EXPAND_BEFORE : y > COMPACT_AFTER;
      if (next === compact) return;
      compact = next;
      lockedUntil = performance.now() + TRANSITION_LOCK_MS;
      setIsCompact(next);
      // Re-check once the animation ends, in case the user kept scrolling meanwhile.
      window.setTimeout(() => {
        if (!frame) frame = window.requestAnimationFrame(update);
      }, TRANSITION_LOCK_MS + 20);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const ministryName = getMinistryName(isArabic);
  const republicName = isArabic ? "الجمهورية الإسلامية الموريتانية" : "République Islamique de Mauritanie";
  const logoSource = mediaUrl(information?.logo);
  const nav = [
    { path: "/", ar: "الرئيسية", fr: "Accueil" },
    { path: "/news", ar: "الأخبار", fr: "Actualités" },
    { path: "/ministry", ar: "الوزارة", fr: "Le ministère" },
    { path: "/projects", ar: "المشاريع", fr: "Projets" },
    { path: "/procedures", ar: "الإجراءات والخدمات", fr: "Procédures et services" },
    { path: "/announcements", ar: "إعلانات", fr: "Annonces" },
    { path: "/contact", ar: "تواصل معنا", fr: "Contactez-nous" },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const logo = (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/10 transition-all duration-300 ease-in-out ${
        isCompact ? "h-11 w-11 md:h-14 md:w-14" : "h-14 w-14 md:h-[5.5rem] md:w-[5.5rem]"
      }`}
    >
      {logoSource ? (
        <img src={logoSource} alt={ministryName} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true" className="text-xs font-semibold text-white/70">MO</span>
      )}
    </span>
  );

  const adminLink = (
    <Link
      to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
      aria-label={isArabic ? "لوحة التحكم" : "Espace administration"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-mauritania-gold text-mauritania-green-dark shadow-md transition-all duration-300 hover:brightness-105 ${
        isCompact ? "h-9 w-9 text-sm" : "h-10 w-10 md:h-12 md:w-12 md:text-lg"
      }`}
    >
      <FontAwesomeIcon icon={faUser} />
    </Link>
  );

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className={`sticky top-0 z-50 border-b-4 border-[#ce1f26] bg-gradient-to-l from-mauritania-green to-mauritania-green-dark text-white transition-shadow duration-300 ${
        isCompact ? "shadow-lg" : "shadow-sm"
      }`}
    >
      {/* Identity bar */}
      <div className="border-b border-white/15">
        <div
          className={`container mx-auto flex items-center justify-between gap-4 px-4 transition-[padding] duration-300 ease-in-out md:px-8 ${
            isCompact ? "py-1.5" : "py-3 md:py-5"
          }`}
        >
          <Link to="/" className="flex min-w-0 items-center gap-3 md:gap-6">
            {logo}
            <div className="min-w-0 text-start">
              <p
                className={`overflow-hidden text-xs font-semibold text-white/90 transition-all duration-300 ease-in-out md:text-sm ${
                  isCompact ? "max-h-0 opacity-0" : "mb-1 max-h-6 opacity-100 md:mb-2"
                }`}
              >
                {republicName}
              </p>
              {ministryName && (
                <h1
                  className={`font-bold leading-snug transition-all duration-300 ease-in-out ${
                    isCompact ? "text-sm md:text-lg" : "text-base md:text-2xl"
                  }`}
                >
                  {ministryName}
                </h1>
              )}
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 md:gap-5">
            {adminLink}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={isArabic ? "Passer en français" : "التبديل إلى العربية"}
              className={`rounded-full border-2 border-white/40 bg-white/10 font-bold transition-all duration-300 hover:bg-white/20 ${
                isCompact ? "px-3 py-1 text-xs md:px-6 md:text-sm" : "px-3 py-1 text-xs md:min-w-[11rem] md:px-8 md:py-2.5 md:text-base"
              }`}
            >
              <span className="md:hidden">{isArabic ? "FR" : "ع"}</span>
              <span className="hidden md:inline">{isArabic ? "Français" : "العربية"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? (isArabic ? "إغلاق القائمة" : "Fermer le menu") : isArabic ? "فتح القائمة" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-white/10 md:hidden"
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav aria-label={isArabic ? "التنقل الرئيسي" : "Navigation principale"}>
        <div className="container mx-auto px-4 md:px-8">
          <div className={`${menuOpen ? "flex" : "hidden"} flex-col md:flex md:flex-row md:items-center md:justify-between`}>
            <ul className="flex min-w-0 flex-col md:flex-row md:flex-wrap md:items-center md:gap-x-4 lg:gap-x-6 xl:gap-x-10">
              {nav.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      className={`relative block whitespace-nowrap font-bold transition-all duration-300 ${
                        isCompact ? "py-2 text-sm md:py-2.5 lg:text-base" : "py-3 text-base md:py-4 md:text-sm lg:text-base xl:text-lg"
                      } ${active ? "text-white" : "text-white/90 hover:text-mauritania-gold"}`}
                    >
                      {isArabic ? item.ar : item.fr}
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-1 start-0 h-[3px] rounded-full bg-[#ce1f26] transition-all duration-300 ${
                          active ? "w-full md:w-full" : "w-0"
                        } ${isCompact ? "md:bottom-1" : "md:bottom-3"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title={isArabic ? "تسجيل الخروج" : "Déconnexion"}
                aria-label={isArabic ? "تسجيل الخروج" : "Déconnexion"}
                className={`flex items-center gap-3 whitespace-nowrap border-t border-white/15 py-3 font-semibold text-white/95 transition-colors duration-300 hover:text-mauritania-gold md:ms-4 md:h-9 md:w-9 md:shrink-0 md:justify-center md:rounded-full md:border md:border-white/30 md:py-0 md:hover:bg-white/10 ${
                  isCompact ? "text-sm" : "text-base"
                }`}
              >
                {/* Icon only on desktop; the stacked mobile menu keeps the text. */}
                <span className="md:sr-only">{isArabic ? "تسجيل الخروج" : "Déconnexion"}</span>
                <FontAwesomeIcon icon={faRightFromBracket} className={isArabic ? "rotate-180" : ""} />
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
