import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import {
  getActualitesCategories,
  createActualiteCategorie,
  updateActualiteCategorie,
  deleteActualiteCategorie,
} from "../../services/api";
import { ActualiteCategorie } from "../../types/types";

const CategorieForm: React.FC = () => {
  const { t, pair } = useT();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<ActualiteCategorie[]>([]);
  const { register, handleSubmit, reset } = useForm<ActualiteCategorie>();

  const fetchCategories = async () => {
    try {
      const response = await getActualitesCategories();
      setCategories(response.data);
    } catch (err) {
      toast.error(t("خطأ في جلب التصنيفات", "Erreur lors du chargement des catégories"));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: ActualiteCategorie) => {
    try {
      if (data.id) {
        await updateActualiteCategorie(data.id, data);
        toast.success(t("تم تحديث التصنيف", "Catégorie mise à jour"));
      } else {
        await createActualiteCategorie(data);
        toast.success(t("تم إضافة التصنيف", "Catégorie ajoutée"));
      }
      reset({});
      fetchCategories();
    } catch (err) {
      toast.error(t("خطأ في الحفظ", "Erreur lors de l'enregistrement"));
    }
  };

  const handleEdit = (cat: ActualiteCategorie) => {
    reset(cat);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!await confirm(t("هل أنت متأكد من الحذف؟", "Êtes-vous sûr de vouloir supprimer cet élément ?"))) return;
    try {
      await deleteActualiteCategorie(id);
      toast.success(t("تم حذف التصنيف", "Catégorie supprimée"));
      fetchCategories();
    } catch (err) {
      toast.error(t("خطأ في الحذف", "Erreur lors de la suppression"));
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">{t("إدارة التصنيفات", "Gestion des catégories")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            dir="rtl"
            placeholder={t("الاسم بالعربي", "Nom en arabe")}
            {...register("nomarabe", { required: true })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            dir="ltr"
            placeholder={t("الاسم بالفرنسي", "Nom en français")}
            {...register("nomfrancais", { required: true })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button className="bg-mauritania-green text-white py-2 px-4 rounded-md">
          {t("حفظ", "Enregistrer")}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">#</th>
            {pair(
              <th key="ar" className="border px-2 py-1">{t("العربي", "Arabe")}</th>,
              <th key="fr" className="border px-2 py-1">{t("فرنسي", "Français")}</th>
            )}
            <th className="border px-2 py-1">{t("إجراءات", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="border px-2 py-1">{cat.id}</td>
              {pair(
                <td key="ar" className="border px-2 py-1" dir="rtl">{cat.nomarabe}</td>,
                <td key="fr" className="border px-2 py-1" dir="ltr">{cat.nomfrancais}</td>
              )}
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-500 text-white px-2 py-1 rounded me-2"
                >
                  {t("تعديل", "Modifier")}
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  {t("حذف", "Supprimer")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default CategorieForm;
