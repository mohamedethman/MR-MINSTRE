import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnnouncementById } from "../../services/api";
import { Announcement } from "../../types/types";
import { useLanguage } from "../../context/LanguageContext";
import { useT } from "../../i18n";
import RichText from "../../components/RichText";
import { isEmptyHtml } from "../../utils/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faBullhorn,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const AnnouncementDetail: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { t, isArabic, dir, formatDate } = useT();
  // "Back" points right in RTL, left in LTR
  const backArrowClass = isArabic ? "rotate-180" : "";

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id, language]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncementById(parseInt(id!));
      setAnnouncement(response.data);
    } catch (error) {
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={dir}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-mauritania-green-dark text-6xl animate-spin mb-4"
            />
            <p className="text-gray-600 text-xl">
              {t("جاري التحميل...", "Chargement…")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50" dir={dir}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faBullhorn}
              className="text-gray-400 text-6xl mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              {t("الإعلان غير موجود", "Annonce introuvable")}
            </h2>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-mauritania-green-dark text-white rounded-lg hover:bg-mauritania-green transition duration-300"
            >
              <FontAwesomeIcon icon={faArrowLeft} className={backArrowClass} />
              {t("العودة إلى صفحة الإعلانات", "Retour aux annonces")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    return (
      (isArabic
        ? announcement.titrearabe || announcement.titrefrancais
        : announcement.titrefrancais || announcement.titrearabe) ||
      t("بدون عنوان", "Sans titre")
    );
  };

  const getContent = () => {
    return (isArabic
      ? announcement.textarabe || announcement.textfrancais
      : announcement.textfrancais || announcement.textarabe) || "";
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Breadcrumb */}

      {/* Announcement Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white p-8">
              <div className="flex justify-between items-start mb-4">
                <Link
                  to="/announcements"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-mauritania-green-dark rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className={backArrowClass} />
                  {t("العودة إلى صفحة الإعلانات", "Retour aux annonces")}
                </Link>

                <div className="flex items-center gap-2 text-mauritania-gold">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>
                    {formatDate(announcement.datepublication) ||
                      t("غير محدد التاريخ", "Date non précisée")}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{getTitle()}</h1>

              {/* Alternative title */}
              {(isArabic && announcement.titrefrancais) ||
              (!isArabic && announcement.titrearabe) ? (
                <p
                  className="text-mauritania-gold-light opacity-90 text-lg"
                  dir={isArabic ? "ltr" : "rtl"}
                >
                  {isArabic
                    ? announcement.titrefrancais
                    : announcement.titrearabe}
                </p>
              ) : null}
            </div>

            {/* Content */}
            <div className="p-8">
              {isEmptyHtml(getContent()) ? (
                <p className="text-gray-500 italic">
                  {t(
                    "لا يوجد محتوى متاح لهذا الإعلان.",
                    "Aucun contenu disponible pour cette annonce."
                  )}
                </p>
              ) : (
                <RichText html={getContent()} dir={dir} className="text-lg" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnnouncementDetail;
