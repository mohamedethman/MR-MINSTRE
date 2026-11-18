import React, { useEffect, useState } from "react";
import { Minister } from "../../types/types";
import { getMinisters } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faLandmark,
  faBook,
  faFileContract,
  faChartLine,
  faSearch,
  faHandshake,
  faTasks,
  faSitemap,
  faLightbulb,
  faUserTie,
  faCog,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

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

interface MinistryProps {
  initialSection?: "projects" | "tasks";
}

const Ministry: React.FC<MinistryProps> = ({ initialSection }) => {
  const [minister, setMinister] = useState<Minister | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
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
              : "https://via.placeholder.com/250x300/007a45/FFFFFF?text=وزير+العقارات",
          };
          setMinister(ministerData);
        }
      } catch (error) {
        console.error("Error fetching minister:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMinister();
  }, []);

  useEffect(() => {
    if (!initialSection) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialSection]);

  // ✅ ministry info
  const ministryData = {
    tasks: {
      ar: [
        "إصدار السندات العقارية والتسجيل النهائي للملكية",
        "تنظيم إجراءات التحويل، الاعتماد، التصحيح، التقسيم، والتوزيع",
        "رقمنة الإجراءات لتسهيل المعاملات العقارية",
        "إعداد الدراسات الخاصة بالإصلاح العقاري والتعاون مع الشركاء الدوليين",
      ],
      fr: [
        "Émission de titres fonciers et enregistrement définitif de la propriété",
        "Régulation des procédures de transfert, certification, correction, division et distribution",
        "Numérisation des procédures pour faciliter les transactions immobilières",
        "Préparation d'études pour la réforme foncière et coopération avec des partenaires internationaux",
      ],
    },
    structure: [
      {
        name: {
          ar: "المديرية العامة للعقارات وأملاك الدولة",
          fr: "Direction Générale des Domaines et des Affaires Foncières",
        },
        icon: faLandmark,
        description: {
          ar: "الإشراف على إدارة وتنظيم أملاك الدولة العقارية",
          fr: "Supervision de la gestion et de la régulation des biens immobiliers de l'État",
        },
      },
      {
        name: {
          ar: "مديرية التحفيظ العقاري",
          fr: "Direction de la Conservation Foncière",
        },
        icon: faBook,
        description: {
          ar: "إصدار السندات العقارية والتسجيل النهائي للملكية",
          fr: "Émission de titres fonciers et enregistrement définitif de la propriété",
        },
      },
      {
        name: {
          ar: "مديرية السجل العقاري",
          fr: "Direction du Registre Foncier",
        },
        icon: faFileContract,
        description: {
          ar: "تنظيم وإدارة السجل العقاري والعمليات المتعلقة به",
          fr: "Organisation et gestion du registre foncier et des opérations connexes",
        },
      },
      {
        name: {
          ar: "مديرية الدراسات والإصلاح العقاري",
          fr: "Direction des Études et de la Réforme Foncière",
        },
        icon: faChartLine,
        description: {
          ar: "إعداد الدراسات الخاصة بالإصلاح العقاري والتطوير",
          fr: "Préparation d'études pour la réforme foncière et le développement",
        },
      },
      {
        name: {
          ar: "مديرية البحث والتحليل",
          fr: "Direction de la Recherche et de l'Analyse",
        },
        icon: faSearch,
        description: {
          ar: "إجراء البحوث والتحليلات لدعم السياسات العقارية",
          fr: "Conduite de recherches et d'analyses pour soutenir les politiques foncières",
        },
      },
      {
        name: {
          ar: "مديرية التعاون والشراكات",
          fr: "Direction de la Coopération et des Partenariats",
        },
        icon: faHandshake,
        description: {
          ar: "تعزيز التعاون مع المؤسسات والشركاء الدوليين",
          fr: "Renforcement de la coopération avec les institutions et partenaires internationaux",
        },
      },
    ],
    projects: {
      ar: [
        "مشروع الرقمنة الشاملة للسجل العقاري",
        "برنامج التكوين المستمر للموظفين",
        "إنشاء منصة إلكترونية للخدمات العقارية",
        "تطوير آليات الشراكة مع القطاع الخاص",
      ],
      fr: [
        "Projet de numérisation complète du registre foncier",
        "Programme de formation continue des employés",
        "Création d'une plateforme électronique pour les services immobiliers",
        "Développement de mécanismes de partenariat avec le secteur privé",
      ],
    },
  };

  // Direction
  const getDirectionClass = () => (language === "ar" ? "rtl" : "ltr");
  const getTextAlignClass = () =>
    language === "ar" ? "text-right" : "text-left";

  return (
    <div className={getDirectionClass()}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {getTranslation("aboutMinistry", language)}
          </h1>
          <p className="mt-4 text-lg max-w-3xl mx-auto leading-relaxed">
            {getTranslation("heroDescription", language)}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-16 h-1 bg-mauritania-gold rounded-full"></div>
          </div>
        </div>
      </section>

      {/* ✅ Minister Section (معالي الوزير) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-mauritania-green-light rounded-full mb-4">
              <FontAwesomeIcon
                icon={faUserTie}
                className="text-mauritania-green-dark text-2xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-mauritania-green-dark">
              {getTranslation("minister", language)}
            </h2>
            <div className="w-16 h-1 bg-mauritania-gold rounded-full mx-auto mt-4"></div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-mauritania-green-dark text-4xl animate-spin mb-4"
              />
              <p className="text-gray-600">
                {getTranslation("loadingMinister", language)}
              </p>
            </div>
          ) : minister ? (
            <div
              className={`flex flex-col md:flex-row gap-10 items-center justify-center ${
                language === "fr" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative">
                  <img
                    src={minister.image}
                    alt={getTranslation("minister", language)}
                    className="w-64 h-64 object-cover rounded-lg shadow-xl border-4 border-white"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-mauritania-gold text-white p-2 rounded-full">
                    <FontAwesomeIcon icon={faUserTie} className="text-lg" />
                  </div>
                </div>
              </div>
              <div className={`w-full md:w-2/3 ${getTextAlignClass()}`}>
                <h3 className="text-2xl font-bold text-mauritania-green-dark mb-4 flex items-center">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={`mr-2 ${
                      language === "ar" ? "ml-2 rotate-180" : ""
                    }`}
                  />
                  {getTranslation("ministerCV", language)}
                </h3>
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line bg-white p-6 rounded-lg shadow-md">
                  {language === "ar"
                    ? minister.textarabe?.substring(0, 300) +
                      (minister.textarabe?.length > 300 ? "..." : "")
                    : minister.textfrancais?.substring(0, 300) +
                      (minister.textfrancais?.length > 300 ? "..." : "")}
                </div>
                <a
                  href="/minister"
                  className="inline-flex items-center mt-6 px-5 py-3 bg-mauritania-green-dark text-white rounded-lg font-semibold hover:bg-mauritania-green transition duration-300 shadow-md hover:shadow-lg"
                >
                  {getTranslation("readMore", language)}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className={`ml-2 transition-transform duration-300 ${
                      language === "ar" ? "rotate-180 mr-2" : ""
                    }`}
                  />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
              <FontAwesomeIcon
                icon={faCog}
                className="text-4xl text-gray-400 mb-4"
              />
              <p className="text-gray-600">
                {getTranslation("noMinisterData", language)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section className="scroll-mt-32 py-16 bg-white" id="tasks">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-mauritania-green-light rounded-full mb-4">
              <FontAwesomeIcon
                icon={faTasks}
                className="text-mauritania-green-dark text-2xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-mauritania-green-dark">
              {language === "ar" ? "المهام" : "Tâches"}
            </h2>
            <div className="w-16 h-1 bg-mauritania-gold rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ministryData.tasks[language === "ar" ? "ar" : "fr"].map(
              (task, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-mauritania-green flex items-start"
                >
                  <div className="bg-mauritania-green-light p-2 rounded-full mr-4">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-mauritania-green-dark text-sm"
                    />
                  </div>
                  <p className="text-gray-700">{task}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-mauritania-green-light rounded-full mb-4">
              <FontAwesomeIcon
                icon={faSitemap}
                className="text-mauritania-green-dark text-2xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-mauritania-green-dark">
              {language === "ar" ? "الهيكلة الإدارية" : "Structure"}
            </h2>
            <div className="w-16 h-1 bg-mauritania-gold rounded-full mx-auto mt-4"></div>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="structure"
          >
            {ministryData.structure.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-mauritania-green"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-mauritania-green-light p-4 rounded-full">
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="text-mauritania-green-dark text-2xl"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-mauritania-green-dark mb-3">
                  {item.name[language === "ar" ? "ar" : "fr"]}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description[language === "ar" ? "ar" : "fr"]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="scroll-mt-32 py-16 bg-white" id="projects">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-mauritania-green-light rounded-full mb-4">
              <FontAwesomeIcon
                icon={faLightbulb}
                className="text-mauritania-green-dark text-2xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-mauritania-green-dark">
              {language === "ar" ? "المشاريع" : "Projets"}
            </h2>
            <div className="w-16 h-1 bg-mauritania-gold rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ministryData.projects[language === "ar" ? "ar" : "fr"].map(
              (project, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-r-4 border-mauritania-green flex items-start"
                >
                  <div className="bg-mauritania-green-light p-2 rounded-full mr-4">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-mauritania-green-dark text-sm"
                    />
                  </div>
                  <p className="text-gray-700">{project}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ministry;
