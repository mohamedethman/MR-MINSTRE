import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../../services/api";
import type { Actualite } from "../../types/types";
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

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      setNewsItems(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  // تنظيف النص من الوسوم HTML
  const cleanHtmlTags = (text: string) => {
    if (!text) return "";
    return text
      .replace(/<p><p>/g, "")
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/<[^>]*>/g, "")
      .trim();
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faNewspaper}
              className="text-white text-4xl mr-3"
            />
            <h1 className="text-4xl font-bold">أخبار الوزارة</h1>
          </div>
          <p className="text-xl">
            آخر الأخبار والتطورات في وزارة العقارات وأملاك الدولة
          </p>
        </div>
      </section>

      {/* News Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
            <p className="mt-2 text-gray-600">جاري تحميل الأخبار...</p>
          </div>
        ) : currentNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">لا توجد أخبار متاحة</p>
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
                  <div className="relative h-0 pb-[56.25%] overflow-hidden">
                    <img
                      src={
                        news.image?.startsWith("data:")
                          ? news.image
                          : news.image
                          ? `data:image/jpeg;base64,${news.image}`
                          : "https://images.unsplash.com/photo-1581093450020-7c01c5c81a2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                      }
                      alt={news.titrearabe || news.titrefrancais}
                      className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-mauritania-gold text-mauritania-green-dark font-semibold py-1 px-3 rounded-full text-sm">
                      خبر
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-mauritania-gold mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      {news.datepublication
                        ? new Date(news.datepublication).toLocaleDateString(
                            "ar-MA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "غير محدد التاريخ"}
                    </div>
                    <h3 className="text-xl font-bold text-mauritania-green-dark mb-4 line-clamp-2">
                      {news.titrearabe || news.titrefrancais}
                    </h3>
                    <div className="text-gray-600 mb-6 whitespace-pre-line line-clamp-3 flex-grow">
                      {cleanHtmlTags(
                        news.textarabe || news.textfrancais || ""
                      ).substring(0, 120)}
                      {(news.textarabe && news.textarabe.length > 120) ||
                      (news.textfrancais && news.textfrancais.length > 120)
                        ? "..."
                        : ""}
                    </div>
                    <Link
                      to={`/news/${news.id}`}
                      className="inline-flex items-center text-mauritania-green-dark font-semibold hover:text-mauritania-green transition duration-300 mt-auto"
                    >
                      قراءة المزيد
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 rounded-md bg-mauritania-green text-white hover:bg-mauritania-green-dark transition duration-300 flex items-center"
                    >
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                      السابق
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
                      className="px-4 py-2 rounded-md bg-mauritania-green text-white hover:bg-mauritania-green-dark transition duration-300 flex items-center"
                    >
                      التالي
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="mr-2 transform rotate-180"
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
