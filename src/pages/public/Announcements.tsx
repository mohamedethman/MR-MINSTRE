import React, { useState, useEffect } from "react";
import { getAnnouncements } from "../../services/api";
import { Announcement } from "../../types/types";
import { useLanguage } from "../../context/LanguageContext";
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import { getTranslation } from "../../utils/translations";
import { Link } from "react-router-dom";
import { stripHtml, truncate } from "../../utils/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faCalendarAlt,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const { language } = useLanguage();
  const { t, isArabic, dir, formatDate } = useT();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Get appropriate title based on language
  const getTitle = (titrearabe?: string, titrefrancais?: string) => {
    return (
      (isArabic ? titrearabe || titrefrancais : titrefrancais || titrearabe) ||
      t("بدون عنوان", "Sans titre")
    );
  };

  return (
    <div dir={dir}>
      <PageHeader
        title={getTranslation("officialAnnouncements", language)}
        subtitle={t("آخر الإعلانات والمناقصات الصادرة عن الوزارة", "Dernières annonces et appels d'offres du ministère")}
      />

      {/* Announcements Section */}
      <section className="py-16 px-8 bg-gray-50" id="announcements">
        <div className="container mx-auto">
          <div className="text-center mb-12 relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faBullhorn}
                className="text-mauritania-gold text-4xl"
              />
              <h2 className="text-3xl font-bold text-mauritania-green-dark inline-block pb-2">
                {getTranslation("officialAnnouncements", language)}
              </h2>
            </div>
            <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-20 h-1 bg-mauritania-gold"></div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-mauritania-green-dark text-4xl animate-spin mb-4"
              />
              <p className="text-gray-600">
                {getTranslation("loadingAnnouncements", language)}
              </p>
            </div>
          ) : announcements.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {currentItems.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white text-mauritania-green-dark rounded-lg overflow-hidden shadow-custom hover:shadow-lg transition duration-300 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-sm text-mauritania-gold font-semibold mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(announcement.datepublication) ||
                          t("غير محدد التاريخ", "Date non précisée")}
                      </div>
                      <h3 className="text-xl font-bold mb-4 line-clamp-2">
                        {getTitle(
                          announcement.titrearabe,
                          announcement.titrefrancais
                        )}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                        {truncate(
                          stripHtml(
                            isArabic
                              ? announcement.textarabe || announcement.textfrancais
                              : announcement.textfrancais || announcement.textarabe
                          ),
                          140
                        )}
                      </p>

                      <Link
                        to={`/announcements/${announcement.id}`}
                        className="inline-flex items-center gap-2 text-mauritania-green font-semibold hover:text-mauritania-green-dark transition duration-300 mt-auto"
                      >
                        {getTranslation("fullDetails", language)}
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className={isArabic ? "rotate-180" : ""}
                        />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-2" aria-label={t("ترقيم الصفحات", "Pagination")}>
                    {/* Previous button */}
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-mauritania-green text-white hover:bg-mauritania-green-dark"
                      }`}
                    >
                      {t("السابق", "Précédent")}
                    </button>

                    {/* Page numbers */}
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === number
                            ? "bg-mauritania-gold text-mauritania-green-dark font-bold"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    {/* Next button */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-mauritania-green text-white hover:bg-mauritania-green-dark"
                      }`}
                    >
                      {t("التالي", "Suivant")}
                    </button>
                  </nav>
                </div>
              )}

              {/* Show current page info */}
              {announcements.length > 0 && (
                <div className="text-center mt-4 text-gray-600">
                  {t(
                    `عرض ${indexOfFirstItem + 1} - ${Math.min(
                      indexOfLastItem,
                      announcements.length
                    )} من أصل ${announcements.length} إعلان`,
                    `Affichage ${indexOfFirstItem + 1} - ${Math.min(
                      indexOfLastItem,
                      announcements.length
                    )} sur ${announcements.length} annonces`
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {getTranslation("noAnnouncements", language)}
                </h3>
                <p className="text-gray-500">
                  {t(
                    "لم يتم نشر أي إعلانات حتى الآن. يرجى التحقق لاحقاً.",
                    "Aucune annonce n'a été publiée pour le moment. Veuillez revenir plus tard."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Announcements;
