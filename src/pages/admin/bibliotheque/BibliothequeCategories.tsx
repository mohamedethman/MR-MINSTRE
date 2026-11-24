import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import {
  getBibliothequeCategories,
  deleteBibliothequeCategorie,
} from "../../../services/api";
import { BibliothequeCategorie } from "../../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "../AdminLayout";
import { useT } from "../../../i18n";
import { useConfirm } from "../../../components/ConfirmDialog";
import CellText from "../../../components/CellText";

const BibliothequeCategories: React.FC = () => {
  const { t, pair } = useT();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<BibliothequeCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getBibliothequeCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("حدث خطأ أثناء جلب التصنيفات", "Erreur lors du chargement des catégories"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا التصنيف؟", "Voulez-vous vraiment supprimer cette catégorie ?"))) {
      try {
        await deleteBibliothequeCategorie(id);
        toast.success(t("تم حذف التصنيف بنجاح", "Catégorie supprimée avec succès"));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(t("حدث خطأ أثناء حذف التصنيف", "Erreur lors de la suppression de la catégorie"));
      }
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.nomarabe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nomfrancais.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة تصنيفات المكتبة", "Gestion des catégories de la médiathèque")}
        </h1>
        <Link
          to="/admin/bibliotheque/categories/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة تصنيف جديد", "Ajouter une catégorie")}
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
            placeholder={t("ابحث عن تصنيف...", "Rechercher une catégorie…")}
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
      ) : filteredCategories.length === 0 ? (
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
                      {t("الاسم (عربي)", "Nom (arabe)")}
                    </th>,
                    <th key="fr" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("الاسم (فرنسي)", "Nom (français)")}
                    </th>
                  )}
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={category.nomarabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={category.nomfrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/bibliotheque/categories/edit/${category.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id!)}
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

export default BibliothequeCategories;
