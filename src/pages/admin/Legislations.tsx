import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { getLegislations, deleteLegislation } from "../../services/api";
import { Legislation } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";

const Legislations: React.FC = () => {
  const [legislations, setLegislations] = useState<Legislation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLegislations();
  }, []);

  const fetchLegislations = async () => {
    try {
      setLoading(true);
      const response = await getLegislations();
      setLegislations(response.data);
    } catch (error) {
      console.error("Error fetching legislations:", error);
      toast.error("حدث خطأ أثناء جلب بيانات التشريعات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التشريع؟")) {
      try {
        await deleteLegislation(id);
        toast.success("تم حذف التشريع بنجاح");
        fetchLegislations();
      } catch (error) {
        console.error("Error deleting legislation:", error);
        toast.error("حدث خطأ أثناء حذف التشريع");
      }
    }
  };

  const handleDownload = (fileData: string, fileName: string) => {
    if (!fileData) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${fileData}`;
    link.download = fileName;
    link.click();
  };

  const filteredLegislations = legislations.filter(
    (legislation) =>
      (legislation.titrearabe?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (legislation.titrefrancais?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (legislation.datesortie?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          إدارة التشريعات
        </h1>
        <Link
          to="/admin/legislations/new"
          className="bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} className="ml-2" />
          إضافة تشريع جديد
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
            placeholder="ابحث عن تشريع..."
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
      ) : filteredLegislations.length === 0 ? (
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
                    العنوان العربي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان الفرنسي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإصدار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الملفات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLegislations.map((legislation) => (
                  <tr key={legislation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {legislation.titrearabe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {legislation.titrefrancais}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {legislation.datesortie
                        ? new Date(legislation.datesortie).toLocaleDateString(
                            "ar-MA"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          legislation.fichierarabe &&
                          handleDownload(
                            legislation.fichierarabe,
                            `legislation-ar-${legislation.id}.pdf`
                          )
                        }
                        className={`text-mauritania-green hover:text-mauritania-green-dark mr-4 ${
                          !legislation.fichierarabe &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        title={
                          legislation.fichierarabe
                            ? "تحميل الملف العربي"
                            : "لا يوجد ملف عربي متاح"
                        }
                        disabled={!legislation.fichierarabe}
                      >
                        <FontAwesomeIcon icon={faDownload} /> عربي
                      </button>
                      <button
                        onClick={() =>
                          legislation.fichierfrancais &&
                          handleDownload(
                            legislation.fichierfrancais,
                            `legislation-fr-${legislation.id}.pdf`
                          )
                        }
                        className={`text-mauritania-green hover:text-mauritania-green-dark mr-4 ${
                          !legislation.fichierfrancais &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        title={
                          legislation.fichierfrancais
                            ? "تحميل الملف الفرنسي"
                            : "لا يوجد ملف فرنسي متاح"
                        }
                        disabled={!legislation.fichierfrancais}
                      >
                        <FontAwesomeIcon icon={faDownload} /> فرنسي
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/legislations/edit/${legislation.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark mr-4"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(legislation.id!)}
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

export default Legislations;
