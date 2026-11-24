import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getMinisters, deleteMinister } from "../../services/api";
import { Minister } from "../../types/types";
import { toast } from "react-toastify";
import { mediaUrl } from "../../utils/content";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import CellText from "../../components/CellText";

const Ministers: React.FC = () => {
  const { t, pair, isArabic } = useT();
  const confirm = useConfirm();
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
      toast.error(t("حدث خطأ أثناء جلب بيانات الوزراء", "Erreur lors du chargement des ministres"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا الوزير؟", "Voulez-vous vraiment supprimer ce ministre ?"))) {
      try {
        await deleteMinister(id);
        toast.success(t("تم حذف الوزير بنجاح", "Ministre supprimé avec succès"));
        fetchMinisters();
      } catch (error) {
        console.error("Error deleting minister:", error);
        toast.error(t("حدث خطأ أثناء حذف الوزير", "Erreur lors de la suppression du ministre"));
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
          {t("إدارة الوزارة", "Gestion du ministère")}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full ps-10 pe-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
            placeholder={t("ابحث عن وزير...", "Rechercher un ministre…")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">{t("جاري تحميل البيانات...", "Chargement des données…")}</p>
        </div>
      ) : filteredMinisters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">{t("لا توجد بيانات متاحة", "Aucune donnée disponible")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الصورة", "Image")}
                  </th>
                  {pair(
                    <th key="ar" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("اللقب (عربي)", "Titre (arabe)")}
                    </th>,
                    <th key="fr" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("اللقب (فرنسي)", "Titre (français)")}
                    </th>
                  )}
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
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
                            mediaUrl(minister.image) || undefined
                          }
                          alt={`${t("صورة الوزير", "Photo du ministre")} ${
                            isArabic
                              ? minister.titrearabe || minister.titrefrancais
                              : minister.titrefrancais || minister.titrearabe
                          }`}
                        />
                      </div>
                    </td>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={minister.titrearabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={minister.titrefrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/ministers/edit/${minister.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(minister.id!)}
                        className="text-red-600 hover:text-red-900"
                        title={t("حذف", "Supprimer")}
                        aria-label={t("حذف", "Supprimer")}
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
