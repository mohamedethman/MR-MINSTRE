import React from "react";
import Sidebar from "./Sidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-light-bg">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
