import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getAnnouncements, deleteAnnouncement } from "../../services/api";
import { Announcement } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import CellText from "../../components/CellText";

const Announcements: React.FC = () => {
  const { t, pair, formatDate } = useT();
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error(t("حدث خطأ أثناء جلب بيانات الإعلانات", "Erreur lors du chargement des annonces"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا الإعلان؟", "Voulez-vous vraiment supprimer cette annonce ?"))) {
      try {
        await deleteAnnouncement(id);
        toast.success(t("تم حذف الإعلان بنجاح", "Annonce supprimée avec succès"));
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error(t("حدث خطأ أثناء حذف الإعلان", "Erreur lors de la suppression de l'annonce"));
      }
    }
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.titrearabe
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      announcement.titrefrancais
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      announcement.datepublication
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة الإعلانات", "Gestion des annonces")}
        </h1>
        <Link
          to="/admin/announcements/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة إعلان جديد", "Ajouter une annonce")}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full ps-10 pe-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
            placeholder={t("ابحث عن إعلان...", "Rechercher une annonce…")}
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
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">{t("لا توجد بيانات متاحة", "Aucune donnée disponible")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {pair(
                    <th key="ar" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("العنوان (عربي)", "Titre (arabe)")}
                    </th>,
                    <th key="fr" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("العنوان (فرنسي)", "Titre (français)")}
                    </th>
                  )}
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("تاريخ النشر", "Date de publication")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id}>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={announcement.titrearabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={announcement.titrefrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(announcement.datepublication, {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/announcements/edit/${announcement.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id!)}
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

export default Announcements;
