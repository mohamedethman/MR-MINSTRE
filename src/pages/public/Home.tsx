import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Added Link import
import { Actualite, Minister, Announcement } from "../../types/types";
import { getNews, getMinisters, getAnnouncements } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import heroImage from "../../assets/slide.jpg"; // adjust the path to your local image

import {
  faCalendarAlt,
  faArrowRight,
  faNewspaper,
  faBullhorn,
  faEye,
  faBullseye,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";

const Home: React.FC = () => {
  const [newsItems, setNewsItems] = useState<Actualite[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ministers, setMinisters] = useState<Minister[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [ministerLoading, setMinisterLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchNews();
    fetchAnnouncements();
    fetchMinisters();
  }, []);

  // دالة لتنظيف النص من الوسوم HTML
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

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNews();
      const cleanedNews = response.data.map((news: Actualite) => ({
        ...news,
        textarabe: cleanHtmlTags(news.textarabe || ""),
        textfrancais: cleanHtmlTags(news.textfrancais || ""),
      }));
      setNewsItems(cleanedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setAnnouncementLoading(true);
      const response = await getAnnouncements();
      const cleanedAnnouncements = response.data.map(
        (announcement: Announcement) => ({
          ...announcement,
          textarabe: cleanHtmlTags(announcement.textarabe || ""),
          textfrancais: cleanHtmlTags(announcement.textfrancais || ""),
        })
      );
      const latestAnnouncements = cleanedAnnouncements.slice(0, 3);
      setAnnouncements(latestAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const fetchMinisters = async () => {
    try {
      setMinisterLoading(true);
      const response = await getMinisters();
      if (response.data && response.data.length > 0) {
        const firstMinister = response.data[0];

        const ministerData: Minister = {
          ...firstMinister,
          textarabe: cleanHtmlTags(firstMinister.textarabe || ""),
          textfrancais: cleanHtmlTags(firstMinister.textfrancais || ""),
          image: firstMinister.image?.startsWith("data:")
            ? firstMinister.image
            : firstMinister.image
            ? `data:image/jpeg;base64,${firstMinister.image}`
            : "https://via.placeholder.com/250x300/007a45/FFFFFF?text=وزير+العقارات",
        };

        setMinisters([ministerData]);
      }
    } catch (error) {
      console.error("Error fetching ministers:", error);
    } finally {
      setMinisterLoading(false);
    }
  };

  // Helper function to get text based on language
  const getText = (arabicText: string, frenchText: string) => {
    return language === "ar" ? arabicText : frenchText;
  };

  // Helper function to get title based on language
  const getTitle = (arabicTitle: string, frenchTitle: string) => {
    return language === "ar" ? arabicTitle : frenchTitle;
  };

  // Direction class based on language
  const getDirectionClass = () => {
    return language === "ar" ? "rtl" : "ltr";
  };

  // Text alignment class based on language
  const getTextAlignClass = () => {
    return language === "ar" ? "text-right" : "text-left";
  };

  return (
    <div className={getDirectionClass()}>
      {/* Hero Section */}
      <section
        className="hero bg-cover bg-center text-white py-20 px-8 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-6 text-mauritania-gold">
            {getTranslation("heroTitle", language)}
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            {getTranslation("heroDescription", language)}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="#tasks"
              className="bg-mauritania-gold text-mauritania-green-dark font-semibold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300"
            >
              {getTranslation("learnMoreButton", language)}
            </Link>
            <Link
              to="#services"
              className="border-2 border-mauritania-gold text-mauritania-gold font-semibold py-3 px-8 rounded hover:bg-mauritania-gold hover:text-mauritania-green-dark transition duration-300"
            >
              {getTranslation("servicesButton", language)}
            </Link>
          </div>
        </div>
      </section>

      {/* Ministry Section */}
      <section className="py-12 px-8 bg-white" id="ministry">
        <div className="container mx-auto">
          <div className="text-center mb-8 relative">
            <h2 className="text-3xl font-bold text-mauritania-green-dark inline-block pb-2">
              {getTranslation("aboutMinistry", language)}
            </h2>
            <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-20 h-1 bg-mauritania-gold"></div>
          </div>

          {ministerLoading ? (
            <div className="text-center py-8 text-gray-600">
              {getTranslation("loadingMinister", language)}
            </div>
          ) : ministers.length > 0 ? (
            <div
              className={`flex flex-col md:flex-row gap-8 items-center justify-center mb-8 ${
                language === "fr" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full md:w-1/3 flex justify-center">
                <img
                  src={ministers[0].image}
                  alt={getTranslation("minister", language)}
                  className="w-48 h-48 object-cover rounded-full border-4 border-mauritania-gold shadow-lg"
                />
              </div>
              <div className={`w-full md:w-2/3 ${getTextAlignClass()}`}>
                <h3 className="text-2xl font-bold text-mauritania-green-dark mb-4">
                  {getTranslation("ministerCV", language)}
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {language === "ar"
                    ? ministers[0].textarabe?.substring(0, 200) +
                      (ministers[0].textarabe?.length > 200 ? "..." : "")
                    : ministers[0].textfrancais?.substring(0, 200) +
                      (ministers[0].textfrancais?.length > 200 ? "..." : "")}
                </div>
                <Link
                  to="/minister"
                  className="inline-flex items-center mt-4 text-mauritania-green-dark font-semibold hover:text-mauritania-green transition duration-300"
                >
                  {getTranslation("readMore", language)}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={`ml-2 ${language === "ar" ? "rotate-180" : ""}`}
                  />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {getTranslation("noMinisterData", language)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-light-bg p-6 rounded-lg shadow-custom">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-mauritania-green-dark text-xl mr-3"
                />
                <h3 className="text-xl font-bold text-mauritania-green-dark">
                  {getTranslation("vision", language)}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {getTranslation("visionText", language)}
              </p>
            </div>
            <div className="bg-light-bg p-6 rounded-lg shadow-custom">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faBullseye}
                  className="text-mauritania-green-dark text-xl mr-3"
                />
                <h3 className="text-xl font-bold text-mauritania-green-dark">
                  {getTranslation("mission", language)}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {getTranslation("missionText", language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section
        className="py-16 px-8 bg-mauritania-green-dark text-white"
        id="announcements"
      >
        <div className="container mx-auto">
          <div className="text-center mb-12 relative">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faBullhorn}
                className="text-mauritania-gold text-4xl mr-3"
              />
              <h2 className="text-3xl font-bold text-mauritania-gold inline-block pb-2">
                {getTranslation("officialAnnouncements", language)}
              </h2>
            </div>
            <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-20 h-1 bg-mauritania-gold"></div>
          </div>

          {announcementLoading ? (
            <div className="text-center py-12 text-mauritania-gold">
              {getTranslation("loadingAnnouncements", language)}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white text-mauritania-green-dark rounded-lg overflow-hidden shadow-custom hover:shadow-lg transition duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-mauritania-gold font-semibold mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      {new Date(
                        announcement.datepublication
                      ).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "fr-FR"
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-4 line-clamp-2">
                      {getTitle(
                        announcement.titrearabe,
                        announcement.titrefrancais
                      )}
                    </h3>
                    <div className="text-gray-600 mb-6 whitespace-pre-line line-clamp-3 flex-grow">
                      {language === "ar"
                        ? (announcement.textarabe?.substring(0, 100) || "") +
                          (announcement.textarabe?.length > 100 ? "..." : "")
                        : (announcement.textfrancais?.substring(0, 100) || "") +
                          (announcement.textfrancais?.length > 100
                            ? "..."
                            : "")}
                    </div>

                    <Link
                      to={`/announcements/${announcement.id}`}
                      className="inline-flex items-center text-mauritania-green font-semibold hover:text-mauritania-green-dark transition duration-300 mt-auto"
                    >
                      {getTranslation("fullDetails", language)}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`ml-2 ${
                          language === "ar" ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-mauritania-gold">
              {getTranslation("noAnnouncements", language)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/announcements"
              className="inline-flex items-center bg-mauritania-gold text-mauritania-green-dark font-semibold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300"
            >
              {getTranslation("moreAnnouncements", language)}
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`ml-2 ${language === "ar" ? "rotate-180" : ""}`}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced News Section */}
      <section className="py-16 px-8 bg-light-bg" id="news">
        <div className="container mx-auto">
          <div className="text-center mb-12 relative">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faNewspaper}
                className="text-mauritania-green-dark text-4xl mr-3"
              />
              <h2 className="text-3xl font-bold text-mauritania-green-dark inline-block pb-2">
                {getTranslation("ministryNews", language)}
              </h2>
            </div>
            <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-20 h-1 bg-mauritania-gold"></div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              {getTranslation("loadingNews", language)}
            </div>
          ) : newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((news) => (
                <div
                  key={news.id}
                  className="bg-white rounded-lg overflow-hidden shadow-custom hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Image container with fixed aspect ratio */}
                  <div className="relative h-0 pb-[56.25%] overflow-hidden">
                    {" "}
                    {/* 16:9 aspect ratio */}
                    <img
                      src={
                        news.image?.startsWith("data:")
                          ? news.image
                          : news.image
                          ? `data:image/jpeg;base64,${news.image}`
                          : "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      }
                      alt={getTitle(news.titrearabe, news.titrefrancais)}
                      className="absolute inset-0 w-full h-full object-cover transition duration-700 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-mauritania-gold text-mauritania-green-dark font-semibold py-1 px-3 rounded-full text-sm">
                      {getTranslation("news", language)}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-mauritania-gold mb-3">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      {new Date(news.datepublication).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-mauritania-green-dark mb-4 line-clamp-2">
                      {getTitle(news.titrearabe, news.titrefrancais)}
                    </h3>
                    <div className="text-gray-600 mb-6 whitespace-pre-line line-clamp-3 flex-grow">
                      {language === "ar"
                        ? (news.textarabe?.substring(0, 120) || "") +
                          (news.textarabe?.length > 120 ? "..." : "")
                        : (news.textfrancais?.substring(0, 120) || "") +
                          (news.textfrancais?.length > 120 ? "..." : "")}
                    </div>

                    <Link
                      to={`/news/${news.id}`}
                      className="inline-flex items-center text-mauritania-green-dark font-semibold hover:text-mauritania-green transition duration-300 mt-auto"
                    >
                      {getTranslation("readMore", language)}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`ml-2 ${
                          language === "ar" ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              {getTranslation("noNews", language)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/news"
              className="inline-flex items-center bg-mauritania-gold text-mauritania-green-dark font-semibold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300"
            >
              {getTranslation("moreNews", language)}
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`ml-2 ${language === "ar" ? "rotate-180" : ""}`}
              />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;
