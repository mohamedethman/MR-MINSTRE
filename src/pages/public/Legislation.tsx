import React, { useState, useEffect, useMemo } from "react";
import { getLegislations } from "../../services/api";
import type { Legislation as LegislationType } from "../../types/types";
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import { downloadMedia, openMedia } from "../../utils/content";

const ITEMS_PER_PAGE = 10;

const Legislation: React.FC = () => {
  const [legislations, setLegislations] = useState<LegislationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t, pair, isArabic, dir, formatDate } = useT();

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
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileData: string, fileName: string) => {
    downloadMedia(fileData, fileName, "application/pdf");
  };

  const handleView = (fileData: string) => {
    openMedia(fileData, "application/pdf");
  };

  // البحث في التشريعات مع التصفية
  const filteredLegislations = useMemo(() => {
    return legislations.filter(
      (law) =>
        (law.titrearabe?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (law.titrefrancais?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (law.datesortie?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [legislations, searchTerm]);

  // التقسيم إلى صفحات
  const paginatedLegislations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLegislations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLegislations, currentPage]);

  const totalPages = Math.ceil(filteredLegislations.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen" dir={dir}>
      <PageHeader
        title={t("التشريعات والقوانين", "Législation et réglementation")}
        subtitle={t(
          "النصوص القانونية والتشريعات المنظمة للقطاع العقاري",
          "Les textes juridiques et réglementaires régissant le secteur foncier"
        )}
      />

      {/* Legislation Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Search Box */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="w-full ps-10 pe-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
              placeholder={t("ابحث في التشريعات...", "Rechercher dans la législation…")}
              aria-label={t("ابحث في التشريعات", "Rechercher dans la législation")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
            <p className="mt-2 text-gray-600">{t("جاري تحميل التشريعات...", "Chargement des textes législatifs…")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedLegislations.map((law) => (
                <div
                  key={law.id}
                  className="bg-white p-6 rounded-lg shadow-custom hover:shadow-md transition duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-mauritania-green-dark mb-2">
                        {(isArabic
                          ? law.titrearabe || law.titrefrancais
                          : law.titrefrancais || law.titrearabe) ||
                          t("بدون عنوان", "Sans titre")}
                      </h3>
                      {law.titrearabe && law.titrefrancais && (
                        <p
                          className="text-gray-600 mb-2"
                          dir={isArabic ? "ltr" : "rtl"}
                        >
                          {isArabic ? law.titrefrancais : law.titrearabe}
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        {law.datesortie
                          ? formatDate(law.datesortie)
                          : t("غير محدد التاريخ", "Date non précisée")}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {pair(
                      law.fichierarabe && (
                        <div key="ar" className="flex flex-col items-center">
                          <button
                            onClick={() => handleView(law.fichierarabe!)}
                            className="bg-mauritania-green text-white py-2 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 mb-2 sm:mb-0"
                            title={t("معاينة الملف العربي", "Consulter la version arabe")}
                          >
                            {t("معاينة عربي", "Consulter (arabe)")}
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                law.fichierarabe!,
                                `${t("تشريع-عربي", "legislation-arabe")}-${law.id}.pdf`
                              )
                            }
                            className="text-mauritania-green hover:text-mauritania-green-dark text-sm"
                            title={t("تحميل الملف العربي", "Télécharger la version arabe")}
                          >
                            {t("تحميل", "Télécharger")}
                          </button>
                        </div>
                      ),
                      law.fichierfrancais && (
                        <div key="fr" className="flex flex-col items-center">
                          <button
                            onClick={() => handleView(law.fichierfrancais!)}
                            className="bg-mauritania-green text-white py-2 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 mb-2 sm:mb-0"
                            title={t("معاينة الملف الفرنسي", "Consulter la version française")}
                          >
                            {t("معاينة فرنسي", "Consulter (français)")}
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                law.fichierfrancais!,
                                `${t("تشريع-فرنسي", "legislation-francais")}-${law.id}.pdf`
                              )
                            }
                            className="text-mauritania-green hover:text-mauritania-green-dark text-sm"
                            title={t("تحميل الملف الفرنسي", "Télécharger la version française")}
                          >
                            {t("تحميل", "Télécharger")}
                          </button>
                        </div>
                      )
                      )}

                      {!law.fichierarabe && !law.fichierfrancais && (
                        <span className="text-gray-500 text-sm">
                          {t("لا يوجد ملف مرفق", "Aucun fichier joint")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex gap-2" aria-label={t("ترقيم الصفحات", "Pagination")}>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    {t("السابق", "Précédent")}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === page
                            ? "bg-mauritania-green text-white"
                            : ""
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    {t("التالي", "Suivant")}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Legislation;
