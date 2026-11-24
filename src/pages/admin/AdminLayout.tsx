import React from "react";
import Sidebar from "./Sidebar";
import { useLanguage } from "../../context/LanguageContext";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="flex min-h-[calc(100vh-3.5rem)] bg-light-bg">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
