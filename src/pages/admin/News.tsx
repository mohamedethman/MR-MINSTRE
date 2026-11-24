import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getNews, deleteNews } from "../../services/api"; // ✅ update service
import { Actualite } from "../../types/types";
import { toast } from "react-toastify";
import { mediaUrl } from "../../utils/content";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import CellText from "../../components/CellText";

const News: React.FC = () => {
  const { t, pair, isArabic, formatDate } = useT();
  const confirm = useConfirm();
  const [news, setNews] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error(t("حدث خطأ أثناء جلب المقالات", "Erreur lors du chargement des actualités"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذه المقالة؟", "Voulez-vous vraiment supprimer cette actualité ?"))) {
      try {
        await deleteNews(id);
        toast.success(t("تم حذف المقالة بنجاح", "Actualité supprimée avec succès"));
        fetchNews();
      } catch (error) {
        console.error("Error deleting news:", error);
        toast.error(t("حدث خطأ أثناء حذف المقالة", "Erreur lors de la suppression de l'actualité"));
      }
    }
  };

  const filteredNews = news.filter(
    (n) =>
      n.titrearabe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.titrefrancais.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة المقالات", "Gestion des actualités")}
        </h1>
        <Link
          to="/admin/news/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة مقالة جديدة", "Ajouter une actualité")}
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
            placeholder={t("ابحث عن مقالة...", "Rechercher une actualité…")}
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
      ) : filteredNews.length === 0 ? (
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
                {filteredNews.map((n) => (
                  <tr key={n.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={
                            mediaUrl(n.image) || undefined
                          }
                          alt={`${t("صورة الخبر", "Image de l'actualité")} ${isArabic ? n.titrearabe || n.titrefrancais : n.titrefrancais || n.titrearabe}`}
                        />
                      </div>
                    </td>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={n.titrearabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={n.titrefrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(n.datepublication, { year: "numeric", month: "numeric", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/news/edit/${n.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(n.id!)}
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

export default News;
