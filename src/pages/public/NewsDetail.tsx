import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNews } from "../../services/api";
import type { Actualite } from "../../types/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faNewspaper,
  faArrowLeft,
  faShareAlt,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<Actualite | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<Actualite[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      const newsItem = response.data.find(
        (item: Actualite) => item.id === parseInt(id!)
      );

      if (newsItem) {
        setNews(newsItem);

        // الحصول على أخبار ذات صلة (آخر 3 أخبار باستثناء الخبر الحالي)
        const related = response.data
          .filter((item: Actualite) => item.id !== parseInt(id!))
          .slice(0, 3);
        setRelatedNews(related);
      }
    } catch (error) {
      console.error("Error fetching news detail:", error);
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

  // مشاركة على وسائل التواصل الاجتماعي
  const shareOnSocialMedia = (platform: string) => {
    const shareUrl = window.location.href;
    const title = news?.titrearabe || news?.titrefrancais || "";
    const text =
      cleanHtmlTags(news?.textarabe || news?.textfrancais || "").substring(
        0,
        100
      ) + "...";

    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(
          title + " " + shareUrl
        )}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  // نسخ رابط الخبر
  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        alert("تم نسخ الرابط بنجاح!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الخبر...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mauritania-green-dark mb-4">
            الخبر غير موجود
          </h2>
          <Link
            to="/news"
            className="text-mauritania-green hover:text-mauritania-green-dark flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
            العودة إلى قائمة الأخبار
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faNewspaper}
              className="text-white text-4xl mr-3"
            />
            <h1 className="text-4xl font-bold">أخبار الوزارة</h1>
          </div>
          <nav className="text-sm flex justify-center items-center">
            <Link to="/" className="hover:underline flex items-center">
              الرئيسية
            </Link>
            <span className="mx-2">/</span>
            <Link to="/news" className="hover:underline">
              الأخبار
            </Link>
            <span className="mx-2">/</span>
            <span>تفاصيل الخبر</span>
          </nav>
        </div>
      </section>

      {/* News Detail Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* News Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={
                news.image?.startsWith("data:")
                  ? news.image
                  : news.image
                  ? `data:image/jpeg;base64,${news.image}`
                  : "https://images.unsplash.com/photo-1581093450020-7c01c5c81a2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              }
              alt={news.titrearabe || news.titrefrancais}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-mauritania-gold text-mauritania-green-dark font-semibold py-1 px-3 rounded-full text-sm">
              خبر
            </div>
          </div>

          {/* News Content */}
          <div className="p-8">
            <div className="flex items-center text-mauritania-gold font-semibold mb-4">
              <FontAwesomeIcon icon={faCalendarAlt} className="ml-2" />
              {news.datepublication
                ? new Date(news.datepublication).toLocaleDateString("ar-MA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "غير محدد التاريخ"}
            </div>

            <h1 className="text-3xl font-bold text-mauritania-green-dark mb-6">
              {news.titrearabe || news.titrefrancais}
            </h1>

            <div className="prose max-w-none mb-8">
              <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {cleanHtmlTags(news.textarabe || news.textfrancais || "")}
              </div>
            </div>

            {/* Share Options */}
            <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0 relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="bg-mauritania-gold text-mauritania-green-dark py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-300 flex items-center"
                >
                  <FontAwesomeIcon icon={faShareAlt} className="ml-2" />
                  مشاركة
                </button>

                {showShareOptions && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                  bg-white rounded-lg shadow-lg p-3 z-10 
                  flex flex-wrap gap-2 justify-center"
                  >
                    <button
                      onClick={() => shareOnSocialMedia("facebook")}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                      title="مشاركة على فيسبوك"
                    >
                      <FontAwesomeIcon icon={faFacebookF} size="sm" />
                    </button>
                    <button
                      onClick={() => shareOnSocialMedia("twitter")}
                      className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition"
                      title="مشاركة على تويتر"
                    >
                      <FontAwesomeIcon icon={faTwitter} size="sm" />
                    </button>
                    <button
                      onClick={() => shareOnSocialMedia("linkedin")}
                      className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center hover:bg-blue-900 transition"
                      title="مشاركة على لينكد إن"
                    >
                      <FontAwesomeIcon icon={faLinkedinIn} size="sm" />
                    </button>
                    <button
                      onClick={() => shareOnSocialMedia("whatsapp")}
                      className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                      title="مشاركة على واتساب"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} size="sm" />
                    </button>
                    <button
                      onClick={copyLink}
                      className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition"
                      title="نسخ الرابط"
                    >
                      <FontAwesomeIcon icon={faLink} size="sm" />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/news"
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
                العودة إلى الأخبار
              </Link>
            </div>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-mauritania-green-dark mb-8 border-b pb-2">
              أخبار ذات صلة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((related) => (
                <div
                  key={related.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="relative h-0 pb-[56.25%] overflow-hidden">
                    <img
                      src={
                        related.image?.startsWith("data:")
                          ? related.image
                          : related.image
                          ? `data:image/jpeg;base64,${related.image}`
                          : "https://images.unsplash.com/photo-1581093450020-7c01c5c81a2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                      }
                      alt={related.titrearabe || related.titrefrancais}
                      className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-mauritania-gold mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="ml-2" />
                      {related.datepublication
                        ? new Date(related.datepublication).toLocaleDateString(
                            "ar-MA"
                          )
                        : "غير محدد التاريخ"}
                    </div>
                    <h3 className="font-bold text-mauritania-green-dark mb-3 line-clamp-2">
                      {related.titrearabe || related.titrefrancais}
                    </h3>
                    <Link
                      to={`/news/${related.id}`}
                      className="text-mauritania-green text-sm hover:text-mauritania-green-dark mt-auto flex items-center"
                    >
                      قراءة المزيد
                      <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
