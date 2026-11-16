import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faNewspaper,
  faBullhorn,
  faGavel,
  faUsers,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import AdminLayout from "./AdminLayout";

const Dashboard: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-mauritania-green-dark mb-8">
        لوحة التحكم
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ministers Card */}
        <Link
          to="/admin/ministers"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-mauritania-green/10 text-mauritania-green mr-4">
              <FontAwesomeIcon icon={faUserTie} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">الوزارة</h2>
              <p className="text-gray-600">إضافة وتعديل وحذف بيانات الوزراء</p>
            </div>
          </div>
        </Link>

        {/* News Card */}
        <Link
          to="#"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FontAwesomeIcon icon={faNewspaper} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">إدارة الأخبار</h2>
              <p className="text-gray-600">إضافة وتعديل وحذف الأخبار</p>
            </div>
          </div>
        </Link>

        {/* Announcements Card */}
        <Link
          to="#"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FontAwesomeIcon icon={faBullhorn} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                إدارة الإعلانات
              </h2>
              <p className="text-gray-600">إضافة وتعديل وحذف الإعلانات</p>
            </div>
          </div>
        </Link>

        {/* Legislation Card */}
        <Link
          to="#"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FontAwesomeIcon icon={faGavel} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                إدارة التشريعات
              </h2>
              <p className="text-gray-600">إضافة وتعديل وحذف التشريعات</p>
            </div>
          </div>
        </Link>

        {/* Users Card */}
        <Link
          to="#"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <FontAwesomeIcon icon={faUsers} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                إدارة المستخدمين
              </h2>
              <p className="text-gray-600">إضافة وتعديل وحذف المستخدمين</p>
            </div>
          </div>
        </Link>

        {/* Statistics Card */}
        <Link
          to="#"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FontAwesomeIcon icon={faChartLine} size="2x" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">الإحصائيات</h2>
              <p className="text-gray-600">عرض إحصائيات الموقع والزيارات</p>
            </div>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
