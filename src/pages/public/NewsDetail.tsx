import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getNews } from "../../services/api";
import type { Actualite } from "../../types/types";
import { useT } from "../../i18n";
import RichText from "../../components/RichText";
import { API_BASE_URL, mediaUrl, openMedia, pickLang } from "../../utils/content";
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
  faXTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<Actualite | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<Actualite[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { t, isArabic, dir, formatDate } = useT();
  // faArrowLeft: "back" points right in RTL, left in LTR; "forward" is the opposite
  const backArrowClass = isArabic ? "rotate-180" : "";
  const forwardArrowClass = isArabic ? "" : "rotate-180";
  const titleOf = (item: Actualite) => pickLang(isArabic, item.titrearabe, item.titrefrancais);
  const bodyOf = (item: Actualite) => (isArabic ? item.textarabe || item.textfrancais : item.textfrancais || item.textarabe) || "";
  const linkOf = (item: Actualite) => (isArabic ? item.lienar || item.lienfr : item.lienfr || item.lienar) || "";

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


  /*
   * Shared links point to the backend share page (/api/share/actualites/:id), which gives
   * Facebook, X and WhatsApp the post's title, short description and image (Open Graph),
   * then forwards readers to the article. The site's own #/news/:id address cannot do that,
   * because crawlers ignore everything after "#".
   */
  const shareOnSocialMedia = (platform: "facebook" | "x" | "whatsapp") => {
    if (!news) return;
    const shareUrl = new URL(`${API_BASE_URL}/share/actualites/${news.id}?lang=${isArabic ? "ar" : "fr"}`, window.location.origin).href;
    const title = titleOf(news);
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      x: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,
    };
    window.open(links[platform], "_blank", "noopener,width=640,height=520");
    setShowShareOptions(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">{t("جاري تحميل الخبر...", "Chargement de l'actualité…")}</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mauritania-green-dark mb-4">
            {t("الخبر غير موجود", "Actualité introuvable")}
          </h2>
          <Link
            to="/news"
            className="text-mauritania-green hover:text-mauritania-green-dark flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className={backArrowClass} />
            {t("العودة إلى قائمة الأخبار", "Retour à la liste des actualités")}
          </Link>
        </div>
      </div>
    );
  }

  const postLink = linkOf(news);

  return (
    <div className="min-h-screen" dir={dir}>
      {/* Breadcrumb (compact, so the post image is visible without scrolling) */}
      <nav aria-label={t("مسار التصفح", "Fil d'Ariane")} className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3 text-sm text-gray-500">
          <Link to="/" className="hover:text-mauritania-green">
            {t("الرئيسية", "Accueil")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/news" className="inline-flex items-center gap-1.5 hover:text-mauritania-green">
            <FontAwesomeIcon icon={faNewspaper} className="text-xs" />
            {t("الأخبار", "Actualités")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 max-w-[60ch] font-medium text-gray-700" aria-current="page">{titleOf(news)}</span>
        </div>
      </nav>

      {/* News Detail Section */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <article className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* News Image */}
          {mediaUrl(news.image) && (
          <div className="relative flex justify-center bg-gray-50 px-4 pt-4 md:px-6 md:pt-6">
            {postLink ? (
              <a
                href={postLink}
                target="_blank"
                rel="noopener noreferrer"
                title={t("فتح رابط الخبر", "Ouvrir le lien de l'actualité")}
                className="group relative block"
              >
                <img
                  src={mediaUrl(news.image) || undefined}
                  alt={titleOf(news)}
                  className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-sm transition group-hover:opacity-95"
                />
                <span className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-mauritania-green-dark shadow">
                  <FontAwesomeIcon icon={faLink} />
                  {t("فتح الرابط", "Ouvrir le lien")}
                </span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => openMedia(news.image)}
                title={t("عرض الصورة بالحجم الكامل", "Voir l'image en taille réelle")}
                className="block cursor-zoom-in"
              >
                <img
                  src={mediaUrl(news.image) || undefined}
                  alt={titleOf(news)}
                  className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
                />
              </button>
            )}
            <div className="absolute top-6 start-6 rounded-full bg-mauritania-gold px-3 py-1 text-sm font-semibold text-mauritania-green-dark md:top-8 md:start-8">
              {t("خبر", "Actualité")}
            </div>
          </div>
          )}

          {/* News Content */}
          <div className="p-8">
            <div className="flex items-center gap-2 text-mauritania-gold font-semibold mb-4">
              <FontAwesomeIcon icon={faCalendarAlt} />
              {news.datepublication
                ? formatDate(news.datepublication)
                : t("غير محدد التاريخ", "Date non précisée")}
            </div>

            <h1 className="text-3xl font-bold text-mauritania-green-dark mb-6">
              {titleOf(news)}
            </h1>

            <div className="mb-8">
              <RichText html={bodyOf(news)} dir={dir} className="text-lg" />
            </div>

            {/* Share Options */}
            <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0 relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="bg-mauritania-gold text-mauritania-green-dark py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-300 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faShareAlt} />
                  {t("مشاركة", "Partager")}
                </button>

                {showShareOptions && (
                  <div className="absolute bottom-full start-0 z-10 mb-2 flex gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                    <button
                      type="button"
                      onClick={() => shareOnSocialMedia("facebook")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:brightness-110"
                      title={t("مشاركة على فيسبوك", "Partager sur Facebook")}
                      aria-label={t("مشاركة على فيسبوك", "Partager sur Facebook")}
                    >
                      <FontAwesomeIcon icon={faFacebookF} />
                    </button>
                    <button
                      type="button"
                      onClick={() => shareOnSocialMedia("x")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800"
                      title={t("مشاركة على X", "Partager sur X")}
                      aria-label={t("مشاركة على X", "Partager sur X")}
                    >
                      <FontAwesomeIcon icon={faXTwitter} />
                    </button>
                    <button
                      type="button"
                      onClick={() => shareOnSocialMedia("whatsapp")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
                      title={t("مشاركة على واتساب", "Partager sur WhatsApp")}
                      aria-label={t("مشاركة على واتساب", "Partager sur WhatsApp")}
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/news"
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} className={backArrowClass} />
                {t("العودة إلى الأخبار", "Retour aux actualités")}
              </Link>
            </div>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-mauritania-green-dark mb-8 border-b pb-2">
              {t("أخبار ذات صلة", "Actualités associées")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((related) => (
                <div
                  key={related.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  {mediaUrl(related.image) && (
                  <Link to={`/news/${related.id}`} className="relative block h-0 pb-[56.25%] overflow-hidden" aria-label={titleOf(related)}>
                    <img
                      src={mediaUrl(related.image) || undefined}
                      alt={titleOf(related)}
                      className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-110"
                    />
                  </Link>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-sm text-mauritania-gold mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {related.datepublication
                        ? formatDate(related.datepublication)
                        : t("غير محدد التاريخ", "Date non précisée")}
                    </div>
                    <h3 className="font-bold text-mauritania-green-dark mb-3 line-clamp-2">
                      {titleOf(related)}
                    </h3>
                    <Link
                      to={`/news/${related.id}`}
                      className="text-mauritania-green text-sm hover:text-mauritania-green-dark mt-auto flex items-center gap-2"
                    >
                      {t("قراءة المزيد", "Lire la suite")}
                      <FontAwesomeIcon icon={faArrowLeft} className={forwardArrowClass} />
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
