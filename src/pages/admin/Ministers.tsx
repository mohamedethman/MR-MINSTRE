import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getMinisters, deleteMinister } from "../../services/api";
import { Minister } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";

const Ministers: React.FC = () => {
  const [ministers, setMinisters] = useState<Minister[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMinisters();
  }, []);

  const fetchMinisters = async () => {
    try {
      setLoading(true);
      const response = await getMinisters();
      setMinisters(response.data);
    } catch (error) {
      console.error("Error fetching ministers:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الوزراء");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الوزير؟")) {
      try {
        await deleteMinister(id);
        toast.success("تم حذف الوزير بنجاح");
        fetchMinisters();
      } catch (error) {
        console.error("Error deleting minister:", error);
        toast.error("حدث خطأ أثناء حذف الوزير");
      }
    }
  };

  const filteredMinisters = ministers.filter(
    (minister) =>
      minister.titrearabe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minister.titrefrancais.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          إدارة الوزارة
        </h1>
        {/* <Link
          to="/admin/ministers/new"
          className="bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} className="ml-2" />
          إضافة وزير جديد
        </Link> */}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
            placeholder="ابحث عن وزير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : filteredMinisters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">لا توجد بيانات متاحة</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اللقب (عربي)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اللقب (فرنسي)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMinisters.map((minister) => (
                  <tr key={minister.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={
                            minister.image?.startsWith("data:")
                              ? minister.image
                              : minister.image
                              ? `data:image/jpeg;base64,${minister.image}`
                              : "https://via.placeholder.com/50"
                          }
                          alt={`صورة الوزير ${
                            minister.titrearabe || minister.titrefrancais
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {minister.titrearabe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {minister.titrefrancais}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/ministers/edit/${minister.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark mr-4"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(minister.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Ministers;
