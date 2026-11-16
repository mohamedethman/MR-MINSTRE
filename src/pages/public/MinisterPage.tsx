import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minister } from "../../types/types";
import { getMinisters } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUserTie,
  faSpinner,
  faFileAlt,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";

const MinisterPage: React.FC = () => {
  const [minister, setMinister] = useState<Minister | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Clean HTML tags from text - same function as in Ministry.tsx
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

  const fetchMinister = async () => {
    try {
      setLoading(true);
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
            : "https://via.placeholder.com/300x400/007a45/FFFFFF?text=وزير+العقارات",
        };
        setMinister(ministerData);
      }
    } catch (error) {
      console.error("Error fetching minister:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinister();
  }, []);

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
              {getTranslation("loadingMinister", language)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!minister) {
    return (
      <div className={`min-h-screen bg-gray-50 ${getDirectionClass()}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-20">
            <FontAwesomeIcon
              icon={faUserTie}
              className="text-gray-400 text-6xl mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              {getTranslation("noMinisterData", language)}
            </h2>
            <Link
              to="/ministry"
              className="inline-flex items-center px-6 py-3 bg-mauritania-green-dark text-white rounded-lg hover:bg-mauritania-green transition duration-300"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className={`mr-2 ${language === "ar" ? "ml-2 rotate-180" : ""}`}
              />
              {getTranslation("backToMinistry", language)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${getDirectionClass()}`}>
      {/* Breadcrumb */}

      {/* Minister Header */}
      <section className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className={`md:w-2/3 ${getTextAlignClass()} mb-8 md:mb-0`}>
              <h1 className="text-4xl font-bold mb-4">
                {getTranslation("minister", language)}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/ministry"
                className="inline-flex items-center px-6 py-3 bg-white text-mauritania-green-dark rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className={`mr-2 ${
                    language === "ar" ? "ml-2 rotate-180" : ""
                  }`}
                />
                {getTranslation("backToMinistry", language)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minister Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar - Minister Info */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-lg sticky top-8 overflow-hidden">
                {/* Minister Photo */}
                <div className="relative">
                  <img
                    src={minister.image}
                    alt={getTranslation("minister", language)}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {minister.titrearabe}
                    </h2>
                    <p className="text-mauritania-gold font-semibold">
                      {language === "ar"
                        ? "وزير العقارات وأملاك الدولة"
                        : "Ministre des Domaines et des Affaires Foncières"}
                    </p>
                  </div>
                </div>

                {/* Minister Details */}
                {/* <div className="p-6">
                  <h3 className="text-lg font-bold text-mauritania-green-dark mb-4 flex items-center">
                    <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                    {getTranslation("minister", language)}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="mr-3 text-mauritania-green"
                      />
                      <span className="font-semibold">
                        {minister.titrefrancais}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="mr-3 text-mauritania-green"
                      />
                      <span>
                        {language === "ar"
                          ? "وزير العقارات وأملاك الدولة"
                          : "Ministre des Domaines et des Affaires Foncières"}
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Welcome Message */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="flex items-center mb-6">
                  <div className="bg-mauritania-green-light p-3 rounded-full mr-4">
                    <FontAwesomeIcon
                      icon={faHandshake}
                      className="text-mauritania-green-dark text-2xl"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-mauritania-green-dark">
                    {language === "ar" ? "كلمة ترحيب" : "Mot de Bienvenue"}
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 italic border-r-4 border-mauritania-gold pr-4">
                    {language === "ar"
                      ? "يسعدني أن أرحب بكم في الموقع الرسمي لوزارة العقارات وأملاك الدولة. نعمل بجد لخدمة المواطن وتحسين الخدمات العقارية."
                      : "Je suis heureux de vous souhaiter la bienvenue sur le site officiel du Ministère des Domaines et des Affaires Foncières. Nous travaillons dur pour servir le citoyen et améliorer les services immobiliers."}
                  </p>
                </div>
              </div>

              {/* Full CV Section */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-mauritania-green-light p-3 rounded-full mr-4">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="text-mauritania-green-dark text-2xl"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-mauritania-green-dark">
                    {getTranslation("ministerCV", language)}
                  </h2>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  {language === "ar" ? (
                    minister.textarabe ? (
                      <div className="whitespace-pre-line text-lg leading-8">
                        {minister.textarabe}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-center py-8">
                        لا تتوفر السيرة الذاتية الكاملة حالياً. سيتم إضافة
                        المعلومات قريباً.
                      </p>
                    )
                  ) : minister.textfrancais ? (
                    <div className="whitespace-pre-line text-lg leading-8">
                      {minister.textfrancais}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-8">
                      Le curriculum vitae complet n'est pas disponible pour le
                      moment. Les informations seront ajoutées prochainement.
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

export default MinisterPage;
