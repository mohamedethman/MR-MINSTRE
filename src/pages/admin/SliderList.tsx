import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { getSliders, deleteSlider, updateSlider } from "../../services/api";
import { SliderApiData } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import CellText from "../../components/CellText";
import { mediaUrl } from "../../utils/content";

const SliderList: React.FC = () => {
  const { t, pair, isArabic } = useT();
  const confirm = useConfirm();
  const [sliders, setSliders] = useState<SliderApiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getSliders();
      const sortedSliders = response.data.sort(
        (a: SliderApiData, b: SliderApiData) => (a.ordre || 0) - (b.ordre || 0)
      );
      setSliders(sortedSliders);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error(t("حدث خطأ أثناء جلب بيانات السلايدر", "Erreur lors du chargement des diapositives"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا السلايدر؟", "Voulez-vous vraiment supprimer cette diapositive ?"))) {
      try {
        await deleteSlider(id);
        toast.success(t("تم حذف السلايدر بنجاح", "Diapositive supprimée avec succès"));
        fetchSliders();
      } catch (error) {
        console.error("Error deleting slider:", error);
        toast.error(t("حدث خطأ أثناء حذف السلايدر", "Erreur lors de la suppression de la diapositive"));
      }
    }
  };

  const handleToggleStatus = async (slider: SliderApiData) => {
    try {
      await updateSlider(slider.id!, {
        ...slider,
        actif: !slider.actif,
      });
      toast.success(
        slider.actif
          ? t("تم إلغاء تفعيل السلايدر بنجاح", "Diapositive désactivée avec succès")
          : t("تم تفعيل السلايدر بنجاح", "Diapositive activée avec succès")
      );
      fetchSliders();
    } catch (error) {
      console.error("Error toggling slider status:", error);
      toast.error(t("حدث خطأ أثناء تغيير حالة السلايدر", "Erreur lors du changement de statut de la diapositive"));
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sliders.length - 1)
    ) {
      return;
    }

    const newSliders = [...sliders];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    const currentOrder = newSliders[index].ordre || 0;
    const targetOrder = newSliders[targetIndex].ordre || 0;

    newSliders[index].ordre = targetOrder;
    newSliders[targetIndex].ordre = currentOrder;

    newSliders.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    setSliders(newSliders);

    try {
      await updateSlider(newSliders[index].id!, newSliders[index]);
      await updateSlider(newSliders[targetIndex].id!, newSliders[targetIndex]);
      toast.success(t("تم تغيير الترتيب بنجاح", "Ordre modifié avec succès"));
    } catch (error) {
      console.error("Error reordering sliders:", error);
      toast.error(t("حدث خطأ أثناء تغيير الترتيب", "Erreur lors de la modification de l'ordre"));
      fetchSliders();
    }
  };

  // Helper function to get image URL safely
  const getImageUrl = (image: string | null | undefined): string | undefined => mediaUrl(image) || undefined;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          {t("إدارة السلايدر الرئيسي", "Gestion du diaporama principal")}
        </h1>
        <Link
          to="/admin/sliders/new"
          className="bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة سلايدر جديد", "Ajouter une diapositive")}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">{t("جاري تحميل البيانات...", "Chargement des données…")}</p>
        </div>
      ) : sliders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">{t("لا توجد سلايدرات متاحة", "Aucune diapositive disponible")}</p>
          <Link
            to="/admin/sliders/new"
            className="inline-block mt-4 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark"
          >
            {t("إضافة سلايدر جديد", "Ajouter une diapositive")}
          </Link>
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
                    {t("الترتيب", "Ordre")}
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
                {sliders.map((slider, index) => (
                  <tr
                    key={slider.id}
                    className={!slider.actif ? "opacity-50 bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-24">
                        <img
                          className="h-16 w-24 rounded bg-gray-100 object-cover"
                          src={getImageUrl(slider.image)}
                          alt={
                            isArabic
                              ? slider.titrearabe || slider.titrefrancais
                              : slider.titrefrancais || slider.titrearabe
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = "hidden";
                          }}
                        />
                      </div>
                    </td>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={slider.titrearabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={slider.titrefrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          title={t("نقل للأعلى", "Monter")}
                          aria-label={t("نقل للأعلى", "Monter")}
                          className={`p-1 mb-1 ${
                            index === 0
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-mauritania-green hover:text-mauritania-green-dark"
                          }`}
                        >
                          <FontAwesomeIcon icon={faArrowUp} />
                        </button>
                        <span className="mx-2 font-bold">
                          {slider.ordre || 0}
                        </span>
                        <button
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === sliders.length - 1}
                          title={t("نقل للأسفل", "Descendre")}
                          aria-label={t("نقل للأسفل", "Descendre")}
                          className={`p-1 mt-1 ${
                            index === sliders.length - 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-mauritania-green hover:text-mauritania-green-dark"
                          }`}
                        >
                          <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(slider)}
                        className={`p-2 rounded-full ${
                          slider.actif
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={slider.actif ? t("إلغاء التفعيل", "Désactiver") : t("تفعيل", "Activer")}
                        aria-label={slider.actif ? t("إلغاء التفعيل", "Désactiver") : t("تفعيل", "Activer")}
                      >
                        <FontAwesomeIcon
                          icon={slider.actif ? faEye : faEyeSlash}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/sliders/edit/${slider.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(slider.id!)}
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

export default SliderList;
