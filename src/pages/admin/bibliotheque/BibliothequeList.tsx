import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
  getBibliothequeItems,
  deleteBibliothequeItem,
  getBibliothequeCategories,
} from "../../../services/api";
import { BibliothequeItem, BibliothequeCategorie } from "../../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "../AdminLayout";
import { useT } from "../../../i18n";
import { useConfirm } from "../../../components/ConfirmDialog";
import CellText from "../../../components/CellText";
import { openMedia } from "../../../utils/content";

const BibliothequeList: React.FC = () => {
  const { t, pair, isArabic } = useT();
  const confirm = useConfirm();
  const [items, setItems] = useState<BibliothequeItem[]>([]);
  const [categories, setCategories] = useState<BibliothequeCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getBibliothequeItems();
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error(t("حدث خطأ أثناء جلب البيانات", "Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getBibliothequeCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا العنصر؟", "Voulez-vous vraiment supprimer cet élément ?"))) {
      try {
        await deleteBibliothequeItem(id);
        toast.success(t("تم حذف العنصر بنجاح", "Élément supprimé avec succès"));
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(t("حدث خطأ أثناء حذف العنصر", "Erreur lors de la suppression de l'élément"));
      }
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category
      ? isArabic
        ? category.nomarabe || category.nomfrancais
        : category.nomfrancais || category.nomarabe
      : t("غير معروف", "Inconnu");
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.descriptionarabe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descriptionfrancais.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      item.categorieId.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة المكتبة المتعددة الوسائط", "Gestion de la médiathèque")}
        </h1>
        <Link
          to="/admin/bibliotheque/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة عنصر جديد", "Ajouter un élément")}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full ps-10 pe-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
              placeholder={t("ابحث في الوصف...", "Rechercher dans la description…")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              aria-label={t("التصنيف", "Catégorie")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t("جميع التصنيفات", "Toutes les catégories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {isArabic
                    ? category.nomarabe || category.nomfrancais
                    : category.nomfrancais || category.nomarabe}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">{t("جاري تحميل البيانات...", "Chargement des données…")}</p>
        </div>
      ) : filteredItems.length === 0 ? (
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
                      {t("الوصف (عربي)", "Description (arabe)")}
                    </th>,
                    <th key="fr" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("الوصف (فرنسي)", "Description (français)")}
                    </th>
                  )}
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("التصنيف", "Catégorie")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("عدد الملفات", "Nombre de fichiers")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الحالة", "Statut")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={item.descriptionarabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={item.descriptionfrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <CellText text={getCategoryName(item.categorieId)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.fichiers.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.etat
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.etat ? t("نشط", "Actif") : t("غير نشط", "Inactif")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/bibliotheque/edit/${item.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-900 me-4"
                        title={t("حذف", "Supprimer")}
                        aria-label={t("حذف", "Supprimer")}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        onClick={() => {
                          // Implement preview functionality
                          if (item.fichiers.length > 0) {
                            openMedia(item.fichiers[0]);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title={t("معاينة", "Aperçu")}
                        aria-label={t("معاينة", "Aperçu")}
                        disabled={item.fichiers.length === 0}
                      >
                        <FontAwesomeIcon icon={faEye} />
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

export default BibliothequeList;
