import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getActualitesCategories,
  createActualiteCategorie,
  updateActualiteCategorie,
  deleteActualiteCategorie,
} from "../../services/api";
import { ActualiteCategorie } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import CellText from "../../components/CellText";

const NewsCategories: React.FC = () => {
  const { t, pair } = useT();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<ActualiteCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] =
    useState<ActualiteCategorie | null>(null);
  const [formData, setFormData] = useState({ nomarabe: "", nomfrancais: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getActualitesCategories();
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء جلب التصنيفات", "Erreur lors du chargement des catégories"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateActualiteCategorie(editingCategory.id!, formData);
        toast.success(t("تم تحديث التصنيف بنجاح", "Catégorie mise à jour avec succès"));
      } else {
        await createActualiteCategorie(formData);
        toast.success(t("تمت إضافة التصنيف بنجاح", "Catégorie ajoutée avec succès"));
      }
      setFormData({ nomarabe: "", nomfrancais: "" });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء حفظ التصنيف", "Erreur lors de l'enregistrement de la catégorie"));
    }
  };

  const handleEdit = (category: ActualiteCategorie) => {
    setEditingCategory(category);
    setFormData({
      nomarabe: category.nomarabe,
      nomfrancais: category.nomfrancais,
    });
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (await confirm(t("هل أنت متأكد من حذف هذا التصنيف؟", "Voulez-vous vraiment supprimer cette catégorie ?"))) {
      try {
        await deleteActualiteCategorie(id);
        toast.success(t("تم حذف التصنيف بنجاح", "Catégorie supprimée avec succès"));
        fetchCategories();
      } catch (error) {
        console.error(error);
        toast.error(t("حدث خطأ أثناء حذف التصنيف", "Erreur lors de la suppression de la catégorie"));
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة التصنيفات", "Gestion des catégories d'actualités")}
        </h1>
        <Link
          to="/admin/news/categories/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة تصنيف جديد", "Ajouter une catégorie")}
        </Link>
      </div>

      {/* Categories Table */}
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
              {categories.map((cat) => (
                <tr key={cat.id}>
                  {pair(
                    <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                      <CellText text={cat.nomarabe} dir="rtl" />
                    </td>,
                    <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                      <CellText text={cat.nomfrancais} dir="ltr" />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                      title={t("تعديل", "Modifier")}
                      aria-label={t("تعديل", "Modifier")}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-900"
                      title={t("حذف", "Supprimer")}
                      aria-label={t("حذف", "Supprimer")}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-600">
                    {t("لا توجد تصنيفات متاحة", "Aucune catégorie disponible")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsCategories;
