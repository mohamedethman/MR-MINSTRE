import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUserTie,
  faNewspaper,
  faBullhorn,
  faGavel,
  faUsers,
  faChartLine,
  faCarTunnel,
  faInfoCircle,
  faEnvelope,
  faNavicon,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { faNode } from "@fortawesome/free-brands-svg-icons";
import { faBook, faPhotoVideo } from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { to: "/admin/dashboard", label: "لوحة التحكم", icon: faTachometerAlt },
    { to: "/admin/sliders", label: "السلايدر", icon: faImages },
    { to: "/admin/ministers", label: "الوزارة", icon: faUserTie },
    { to: "/admin/news", label: "الأخبار", icon: faNewspaper },
    {
      to: "/admin/news/categories",
      label: "تصنبقيات الأخبار",
      icon: faNavicon,
    },
    { to: "/admin/announcements", label: "الإعلانات", icon: faBullhorn },
    { to: "/admin/legislations", label: "التشريعات", icon: faGavel },
    {
      to: "/admin/bibliotheque",
      label: "المكتبة المتعددة الوسائط",
      icon: faPhotoVideo,
    },
    {
      to: "/admin/bibliotheque/categories",
      label: "تصنيفات المكتبة",
      icon: faBook,
    },
    { to: "/admin/information", label: "المعلومات العامة", icon: faInfoCircle }, // Add this
    { to: "/admin/messages", label: "الرسائل", icon: faEnvelope }, // Add this
    { to: "/admin/users", label: "المستخدمين", icon: faUsers },
    { to: "/admin/statistics", label: "الإحصائيات", icon: faChartLine },
  ];

  return (
    <div className="w-64 min-h-screen bg-white shadow-md">
      <div className="p-6 text-2xl font-bold text-mauritania-green-dark border-b">
        لوحة الإدارة
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center px-4 py-2 rounded-md hover:bg-mauritania-green/10 ${
                  location.pathname === link.to
                    ? "bg-mauritania-green/20 text-mauritania-green-dark font-semibold"
                    : "text-gray-700"
                }`}
              >
                <FontAwesomeIcon icon={link.icon} className="ml-2" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
