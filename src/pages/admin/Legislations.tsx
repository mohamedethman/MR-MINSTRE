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
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";
import { downloadMedia } from "../../utils/content";
import CellText from "../../components/CellText";

const Legislations: React.FC = () => {
  const { t, pair, formatDate } = useT();
  const confirm = useConfirm();
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
      toast.error(t("حدث خطأ أثناء جلب بيانات التشريعات", "Erreur lors du chargement des textes législatifs"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذا التشريع؟", "Voulez-vous vraiment supprimer ce texte législatif ?"))) {
      try {
        await deleteLegislation(id);
        toast.success(t("تم حذف التشريع بنجاح", "Texte législatif supprimé avec succès"));
        fetchLegislations();
      } catch (error) {
        console.error("Error deleting legislation:", error);
        toast.error(t("حدث خطأ أثناء حذف التشريع", "Erreur lors de la suppression du texte législatif"));
      }
    }
  };

  const handleDownload = (fileData: string, fileName: string) => {
    downloadMedia(fileData, fileName, "application/pdf");
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
          {t("إدارة التشريعات", "Gestion des textes législatifs")}
        </h1>
        <Link
          to="/admin/legislations/new"
          className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة تشريع جديد", "Ajouter un texte législatif")}
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
            placeholder={t("ابحث عن تشريع...", "Rechercher un texte législatif…")}
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
      ) : filteredLegislations.length === 0 ? (
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
                      {t("العنوان العربي", "Titre (arabe)")}
                    </th>,
                    <th key="fr" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("العنوان الفرنسي", "Titre (français)")}
                    </th>
                  )}
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("تاريخ الإصدار", "Date de parution")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الملفات", "Fichiers")}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLegislations.map((legislation) => (
                  <tr key={legislation.id}>
                    {pair(
                      <td key="ar" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={legislation.titrearabe} dir="rtl" />
                      </td>,
                      <td key="fr" className="px-6 py-4 text-sm text-gray-900">
                        <CellText text={legislation.titrefrancais} dir="ltr" />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {legislation.datesortie
                        ? formatDate(legislation.datesortie, {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })
                        : t("غير متوفر", "N/D")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {pair(
                      <button
                        key="ar"
                        onClick={() =>
                          legislation.fichierarabe &&
                          handleDownload(
                            legislation.fichierarabe,
                            `legislation-ar-${legislation.id}.pdf`
                          )
                        }
                        className={`inline-flex items-center gap-1 text-mauritania-green hover:text-mauritania-green-dark me-4 ${
                          !legislation.fichierarabe &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        title={
                          legislation.fichierarabe
                            ? t("تحميل الملف العربي", "Télécharger le fichier arabe")
                            : t("لا يوجد ملف عربي متاح", "Aucun fichier arabe disponible")
                        }
                        disabled={!legislation.fichierarabe}
                      >
                        <FontAwesomeIcon icon={faDownload} /> {t("عربي", "Arabe")}
                      </button>,
                      <button
                        key="fr"
                        onClick={() =>
                          legislation.fichierfrancais &&
                          handleDownload(
                            legislation.fichierfrancais,
                            `legislation-fr-${legislation.id}.pdf`
                          )
                        }
                        className={`inline-flex items-center gap-1 text-mauritania-green hover:text-mauritania-green-dark me-4 ${
                          !legislation.fichierfrancais &&
                          "opacity-50 cursor-not-allowed"
                        }`}
                        title={
                          legislation.fichierfrancais
                            ? t("تحميل الملف الفرنسي", "Télécharger le fichier français")
                            : t("لا يوجد ملف فرنسي متاح", "Aucun fichier français disponible")
                        }
                        disabled={!legislation.fichierfrancais}
                      >
                        <FontAwesomeIcon icon={faDownload} /> {t("فرنسي", "Français")}
                      </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/legislations/edit/${legislation.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark me-4"
                        title={t("تعديل", "Modifier")}
                        aria-label={t("تعديل", "Modifier")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(legislation.id!)}
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

export default Legislations;
