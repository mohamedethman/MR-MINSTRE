import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faAngleDown,
  faAngleUp,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { getInformation } from "../services/api";
import { Information } from "../types/types";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [information, setInformation] = useState<Information | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLUListElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchInformation();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchInformation = async () => {
    try {
      const response = await getInformation();
      if (response.data && response.data.length > 0) {
        setInformation(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching information:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleDropdownMouseEnter = (dropdown: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(dropdown);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before closing
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  // Check if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Translation for header items
  const getHeaderTranslation = (key: string) => {
    const translations: Record<string, { ar: string; fr: string }> = {
      home: { ar: "الرئيسية", fr: "Accueil" },
      ministry: { ar: "الوزارة", fr: "Ministère" },
      aboutMinistry: { ar: "عن الوزارة", fr: "À propos" },
      minister: { ar: "الوزير", fr: "Ministre" },
      tasks: { ar: "المهام", fr: "Missions" },
      structure: { ar: "الهيكلة الإدارية", fr: "Structure" },
      news: { ar: "الأخبار", fr: "Actualités" },
      announcements: { ar: "إعلانات الوزارة", fr: "Annonces" },
      legislation: { ar: "التشريعات", fr: "Législation" },
      contact: { ar: "تواصل معنا", fr: "Contact" },
      login: { ar: "لوحة التحكم", fr: "Administration" },
      logout: { ar: "تسجيل الخروج", fr: "Déconnexion" },
    };

    return translations[key]?.[language] || key;
  };

  // Direction class based on language
  const getDirectionClass = () => {
    return language === "ar" ? "rtl" : "ltr";
  };

  // Text alignment class based on language
  const getTextAlignClass = () => {
    return language === "ar" ? "text-right" : "text-left";
  };

  return (
    <header
      className={`bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white shadow-custom sticky top-0 z-50 border-b-4 border-[#ce1f26] ${getDirectionClass()}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={
              information?.logo
                ? `data:image/jpeg;base64,${information.logo}`
                : "https://via.placeholder.com/50x50/00a95c/FFFFFF?text=MO"
            }
            alt="Ministry Logo"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className={getTextAlignClass()}>
            <h1 className="text-lg font-bold">
              {information?.nomsite ||
                (language === "ar"
                  ? "وزارة العقارات وأملاك الدولة"
                  : "Ministère des Domaines et des Affaires Foncières")}
            </h1>
            <p className="text-xs opacity-90">
              {language === "ar"
                ? "الجمهورية الإسلامية الموريتانية"
                : "République Islamique de Mauritanie"}
            </p>
          </div>
        </div>

        {/* Language Switcher and Mobile menu toggle */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-3 py-1"
            title={language === "ar" ? "Switch to French" : "Changer à l'Arabe"}
          >
            <img
              src={
                language === "ar"
                  ? "https://flagcdn.com/w40/fr.png"
                  : "https://flagcdn.com/w40/mr.png"
              }
              alt={language === "ar" ? "French flag" : "Mauritanian flag"}
              className="w-6 h-4 object-cover rounded"
            />
            <span className="text-sm font-medium">
              {language === "ar" ? "FR" : "AR"}
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={toggleMenu}>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`${
            isMenuOpen ? "right-0" : "-right-full"
          } fixed md:static top-0 h-screen md:h-auto w-3/4 md:w-auto bg-mauritania-green-dark md:bg-transparent transition-all duration-300 ease-in-out md:flex md:items-center md:space-x-6 z-40 pt-20 md:pt-0 px-6 md:px-0 ${
            language === "fr" ? "md:space-x-6" : "md:space-x-reverse"
          }`}
        >
          <ul
            className={`flex flex-col md:flex-row md:gap-6 gap-4 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            <li>
              <Link
                to="/"
                className={`hover:text-[#ce1f26] transition pb-1 ${
                  isActiveLink("/")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                }`}
              >
                {getHeaderTranslation("home")}
              </Link>
            </li>

            {/* Dropdown */}
            <li
              className="relative"
              onMouseEnter={() => handleDropdownMouseEnter("ministry")}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                className={`flex items-center gap-1 hover:text-[#ce1f26] transition pb-1 ${
                  location.pathname.startsWith("/ministry")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                } ${language === "fr" ? "flex-row" : "flex-row-reverse"}`}
                onClick={() => toggleDropdown("ministry")}
              >
                {getHeaderTranslation("ministry")}
                <FontAwesomeIcon
                  icon={activeDropdown === "ministry" ? faAngleUp : faAngleDown}
                  className="mt-1"
                />
              </button>
              <ul
                ref={dropdownRef}
                className={`absolute ${
                  language === "ar" ? "right-0" : "left-0"
                } mt-2 bg-mauritania-green-dark rounded-lg shadow-lg min-w-[180px] text-sm ${
                  activeDropdown === "ministry" ? "block" : "hidden"
                }`}
              >
                <li>
                  <Link
                    to="/ministry"
                    className={`block px-4 py-2 hover:bg-[#ce1f26] ${
                      isActiveLink("/ministry")
                        ? "bg-[#ce1f26] font-semibold"
                        : ""
                    }`}
                  >
                    {getHeaderTranslation("aboutMinistry")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/minister"
                    className="block px-4 py-2 hover:bg-[#ce1f26]"
                  >
                    {getHeaderTranslation("minister")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ministry#tasks"
                    className="block px-4 py-2 hover:bg-[#ce1f26]"
                  >
                    {getHeaderTranslation("tasks")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ministry#structure"
                    className="block px-4 py-2 hover:bg-[#ce1f26]"
                  >
                    {getHeaderTranslation("structure")}
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link
                to="/news"
                className={`hover:text-[#ce1f26] transition pb-1 ${
                  isActiveLink("/news")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                }`}
              >
                {getHeaderTranslation("news")}
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className={`hover:text-[#ce1f26] transition pb-1 ${
                  isActiveLink("/announcements")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                }`}
              >
                {getHeaderTranslation("announcements")}
              </Link>
            </li>
            <li>
              <Link
                to="/legislation"
                className={`hover:text-[#ce1f26] transition pb-1 ${
                  isActiveLink("/legislation")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                }`}
              >
                {getHeaderTranslation("legislation")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`hover:text-[#ce1f26] transition pb-1 ${
                  isActiveLink("/contact")
                    ? "border-b-2 border-[#ce1f26] font-semibold"
                    : ""
                }`}
              >
                {getHeaderTranslation("contact")}
              </Link>
            </li>

            {isAuthenticated ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-[#ce1f26] transition"
                >
                  {getHeaderTranslation("logout")}
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/admin/login"
                  className={`hover:text-[#ce1f26] transition pb-1 ${
                    isActiveLink("/admin/login")
                      ? "border-b-2 border-[#ce1f26] font-semibold"
                      : ""
                  }`}
                >
                  {getHeaderTranslation("login")}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
