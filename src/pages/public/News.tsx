import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../../services/api";
import type { Actualite } from "../../types/types";
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import { mediaUrl, pickLang, stripHtml, truncate } from "../../utils/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faNewspaper,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const News: React.FC = () => {
  const [newsItems, setNewsItems] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { t, isArabic, dir, formatDate } = useT();
  // Arrows pointing "forward" / "backward" in the reading direction
  const forwardArrowClass = isArabic ? "rotate-180" : "";
  const backwardArrowClass = isArabic ? "" : "rotate-180";

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      setNewsItems(
        Array.isArray(response.data)
          ? [...response.data].sort((a: Actualite, b: Actualite) => (b.datepublication || "").localeCompare(a.datepublication || ""))
          : []
      );
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };


  // حساب عدد الصفحات
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);

  // الحصول على الأخبار للصفحة الحالية
  const currentNews = newsItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" dir={dir}>
      <PageHeader
        icon={faNewspaper}
        title={t("أخبار الوزارة", "Actualités du ministère")}
        subtitle={t(
          "آخر الأخبار والتطورات في وزارة العقارات وأملاك الدولة",
          "Les dernières actualités et évolutions du ministère"
        )}
      />

      {/* News Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
            <p className="mt-2 text-gray-600">{t("جاري تحميل الأخبار...", "Chargement des actualités…")}</p>
          </div>
        ) : currentNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">{t("لا توجد أخبار متاحة", "Aucune actualité disponible")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-white rounded-lg overflow-hidden shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Image container with fixed aspect ratio */}
                  {mediaUrl(news.image) && (
                  <Link to={`/news/${news.id}`} className="relative block h-0 pb-[56.25%] overflow-hidden" aria-label={pickLang(isArabic, news.titrearabe, news.titrefrancais)}>
                    <img
                      src={mediaUrl(news.image) || undefined}
                      alt={pickLang(isArabic, news.titrearabe, news.titrefrancais)}
                      className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-110"
                    />
                    <div className="absolute top-4 start-4 bg-mauritania-gold text-mauritania-green-dark font-semibold py-1 px-3 rounded-full text-sm">
                      {t("خبر", "Actualité")}
                    </div>
                  </Link>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-sm text-mauritania-gold mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {news.datepublication
                        ? formatDate(news.datepublication)
                        : t("غير محدد التاريخ", "Date non précisée")}
                    </div>
                    <h3 className="text-xl font-bold text-mauritania-green-dark mb-4 line-clamp-2">
                      {pickLang(isArabic, news.titrearabe, news.titrefrancais)}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                      {truncate(stripHtml(isArabic ? news.textarabe || news.textfrancais : news.textfrancais || news.textarabe), 160)}
                    </p>
                    <Link
                      to={`/news/${news.id}`}
                      className="inline-flex items-center gap-2 text-mauritania-green-dark font-semibold hover:text-mauritania-green transition duration-300 mt-auto"
                    >
                      {t("قراءة المزيد", "Lire la suite")}
                      <FontAwesomeIcon icon={faArrowRight} className={forwardArrowClass} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-2" aria-label={t("ترقيم الصفحات", "Pagination")}>
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 rounded-md bg-mauritania-green text-white hover:bg-mauritania-green-dark transition duration-300 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faArrowRight} className={backwardArrowClass} />
                      {t("السابق", "Précédent")}
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === page
                            ? "bg-mauritania-green text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-mauritania-gold"
                        } transition duration-300`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 rounded-md bg-mauritania-green text-white hover:bg-mauritania-green-dark transition duration-300 flex items-center gap-2"
                    >
                      {t("التالي", "Suivant")}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={forwardArrowClass}
                      />
                    </button>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
