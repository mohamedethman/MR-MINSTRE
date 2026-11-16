import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnnouncementById } from "../../services/api";
import { Announcement } from "../../types/types";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
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

  // Clean HTML tags from text
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

  // Direction and text alignment
  const getDirectionClass = () => (language === "ar" ? "rtl" : "ltr");
  const getTextAlignClass = () =>
    language === "ar" ? "text-right" : "text-left";

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${getDirectionClass()}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-mauritania-green-dark text-6xl animate-spin mb-4"
            />
            <p className="text-gray-600 text-xl">
              {getTranslation("loading", language)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className={`min-h-screen bg-gray-50 ${getDirectionClass()}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faBullhorn}
              className="text-gray-400 text-6xl mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              {getTranslation("announcementNotFound", language)}
            </h2>
            <Link
              to="/announcements"
              className="inline-flex items-center px-6 py-3 bg-mauritania-green-dark text-white rounded-lg hover:bg-mauritania-green transition duration-300"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className={`mr-2 ${language === "ar" ? "ml-2 rotate-180" : ""}`}
              />
              {getTranslation("backToAnnouncements", language)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    return language === "ar"
      ? announcement.titrearabe || announcement.titrefrancais || "بدون عنوان"
      : announcement.titrefrancais || announcement.titrearabe || "Sans titre";
  };

  const getContent = () => {
    const content =
      language === "ar" ? announcement.textarabe : announcement.textfrancais;
    return cleanHtmlTags(content || "");
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${getDirectionClass()}`}>
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
                  className="inline-flex items-center px-4 py-2 bg-white text-mauritania-green-dark rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className={`mr-2 ${
                      language === "ar" ? "ml-2 rotate-180" : ""
                    }`}
                  />
                  {getTranslation("backToAnnouncements", language)}
                </Link>

                <div className="flex items-center text-mauritania-gold">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  <span>
                    {new Date(announcement.datepublication).toLocaleDateString(
                      language === "ar" ? "ar-EG" : "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{getTitle()}</h1>

              {/* Alternative title */}
              {(language === "ar" && announcement.titrefrancais) ||
              (language === "fr" && announcement.titrearabe) ? (
                <p className="text-mauritania-gold-light opacity-90 text-lg">
                  {language === "ar"
                    ? announcement.titrefrancais
                    : announcement.titrearabe}
                </p>
              ) : null}
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {getContent() || (
                    <p className="text-gray-500 italic">
                      {language === "ar"
                        ? "لا يوجد محتوى متاح لهذا الإعلان."
                        : "Aucun contenu disponible pour cette annonce."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnnouncementDetail;
