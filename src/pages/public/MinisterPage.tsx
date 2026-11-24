import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minister } from "../../types/types";
import { getMinisters, getMotMinistre } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
import PageHeader from "../../components/PageHeader";
import SectionTitle from "../../components/SectionTitle";
import RichText from "../../components/RichText";
import { isEmptyHtml, mediaUrl, pickLang } from "../../utils/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserTie, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface MotMinistre {
  id: number;
  titrearabe?: string;
  titrefrancais?: string;
  textarabe?: string;
  textfrancais?: string;
}

const MinisterPage: React.FC = () => {
  const [minister, setMinister] = useState<Minister | null>(null);
  const [word, setWord] = useState<MotMinistre | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getMinisters(), getMotMinistre()]).then(([ministerResult, wordResult]) => {
      if (!mounted) return;
      if (ministerResult.status === "fulfilled" && Array.isArray(ministerResult.value.data)) {
        setMinister(ministerResult.value.data[0] || null);
      }
      if (wordResult.status === "fulfilled" && Array.isArray(wordResult.value.data)) {
        setWord(wordResult.value.data[0] || null);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const backLink = (
    <Link
      to="/ministry"
      className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-mauritania-green-dark transition duration-300 hover:bg-gray-100"
    >
      <FontAwesomeIcon icon={faArrowLeft} className={isArabic ? "rotate-180" : ""} />
      {getTranslation("backToMinistry", language)}
    </Link>
  );

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <FontAwesomeIcon icon={faSpinner} className="mb-4 animate-spin text-6xl text-mauritania-green-dark" />
          <p className="text-xl text-gray-600">{getTranslation("loadingMinister", language)}</p>
        </div>
      </div>
    );
  }

  if (!minister) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <FontAwesomeIcon icon={faUserTie} className="mb-4 text-6xl text-gray-400" />
          <h2 className="mb-6 text-2xl font-bold text-gray-600">{getTranslation("noMinisterData", language)}</h2>
          <div className="[&>a]:bg-mauritania-green-dark [&>a]:text-white">{backLink}</div>
        </div>
      </div>
    );
  }

  const name = pickLang(isArabic, minister.titrearabe, minister.titrefrancais);
  const image = mediaUrl(minister.image);
  const cv = isArabic ? minister.textarabe || minister.textfrancais : minister.textfrancais || minister.textarabe;
  const wordTitle = word ? pickLang(isArabic, word.titrearabe, word.titrefrancais) : "";
  const wordText = word ? (isArabic ? word.textarabe || word.textfrancais : word.textfrancais || word.textarabe) : "";

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <PageHeader
        title={getTranslation("minister", language)}
        crumbs={[{ label: getTranslation("aboutMinistry", language), to: "/ministry" }]}
      />

      <section className="py-8">
        <div className="container mx-auto flex flex-col gap-12 px-4 lg:flex-row">
          <div className="lg:w-1/3">
            <div className="sticky top-36 overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="relative">
                {image ? (
                  <img src={image} alt={name} className="h-80 w-full object-cover" />
                ) : (
                  <div className="flex h-80 w-full items-center justify-center bg-mauritania-green-dark/10">
                    <FontAwesomeIcon icon={faUserTie} className="text-8xl text-mauritania-green-dark/30" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  {name && <h2 className="mb-1 text-2xl font-bold text-white">{name}</h2>}
                  <p className="font-semibold text-mauritania-gold">{getTranslation("minister", language)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            {!isEmptyHtml(wordText) && (
              <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
                <SectionTitle title={wordTitle || (isArabic ? "كلمة الوزير" : "Mot du Ministre")} />
                <RichText html={wordText} dir={dir} />
              </div>
            )}

            <div className="rounded-lg bg-white p-8 shadow-lg">
              <SectionTitle title={getTranslation("ministerCV", language)} />
              {isEmptyHtml(cv) ? (
                <p className="py-8 text-center italic text-gray-500">
                  {isArabic ? "لا تتوفر السيرة الذاتية الكاملة حالياً." : "Le curriculum vitae complet n'est pas disponible pour le moment."}
                </p>
              ) : (
                <RichText html={cv} dir={dir} className="text-lg" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MinisterPage;
