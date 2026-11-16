import React, { useState, useEffect, useMemo } from "react";
import { getLegislations } from "../../services/api";
import type { Legislation as LegislationType } from "../../types/types";

const ITEMS_PER_PAGE = 10;

const Legislation: React.FC = () => {
  const [legislations, setLegislations] = useState<LegislationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
    if (!fileData) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${fileData}`;
    link.download = fileName;
    link.click();
  };

  const handleView = (fileData: string) => {
    if (!fileData) return;

    const pdfWindow = window.open();
    if (pdfWindow) {
      pdfWindow.document.write(`
        <iframe width="100%" height="100%" src="data:application/pdf;base64,${fileData}"></iframe>
      `);
    }
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">التشريعات والقوانين</h1>
          <p className="text-xl">
            النصوص القانونية والتشريعات المنظمة للقطاع العقاري
          </p>
        </div>
      </section>

      {/* Legislation Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Search Box */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
              className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:border-transparent"
              placeholder="ابحث في التشريعات..."
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
            <p className="mt-2 text-gray-600">جاري تحميل التشريعات...</p>
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
                        {law.titrearabe || "بدون عنوان عربي"}
                      </h3>
                      {law.titrefrancais && (
                        <p className="text-gray-600 mb-2">
                          {law.titrefrancais}
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        {law.datesortie
                          ? new Date(law.datesortie).toLocaleDateString("ar-MA")
                          : "غير محدد التاريخ"}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {law.fichierarabe && (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleView(law.fichierarabe!)}
                            className="bg-mauritania-green text-white py-2 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 mb-2 sm:mb-0"
                            title="معاينة الملف العربي"
                          >
                            معاينة عربي
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                law.fichierarabe!,
                                `تشريع-عربي-${law.id}.pdf`
                              )
                            }
                            className="text-mauritania-green hover:text-mauritania-green-dark text-sm"
                            title="تحميل الملف العربي"
                          >
                            تحميل
                          </button>
                        </div>
                      )}

                      {law.fichierfrancais && (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleView(law.fichierfrancais!)}
                            className="bg-mauritania-green text-white py-2 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 mb-2 sm:mb-0"
                            title="معاينة الملف الفرنسي"
                          >
                            معاينة فرنسي
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                law.fichierfrancais!,
                                `تشريع-فرنسي-${law.id}.pdf`
                              )
                            }
                            className="text-mauritania-green hover:text-mauritania-green-dark text-sm"
                            title="تحميل الملف الفرنسي"
                          >
                            تحميل
                          </button>
                        </div>
                      )}

                      {!law.fichierarabe && !law.fichierfrancais && (
                        <span className="text-gray-500 text-sm">
                          لا يوجد ملف مرفق
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
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    السابق
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
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Legislation;
