import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ListeTacheMinistere,
  Minister,
  StructureAdministrative,
  TacheMinistere,
} from "../../types/types";
import {
  getListeTaches,
  getMinisters,
  getProceduresServices,
  getStructureAdministrative,
  getTachesMinistere,
} from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../utils/translations";
import PageHeader from "../../components/PageHeader";
import SectionTitle from "../../components/SectionTitle";
import RichText from "../../components/RichText";
import { isEmptyHtml, mediaUrl, pickLang } from "../../utils/content";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faFileDownload,
  faListCheck,
  faSpinner,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

interface ProcedureService {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe?: string;
  textfrancais?: string;
  image?: string;
  fichier?: string;
}

interface MinistryProps {
  initialSection?: "tasks" | "procedures";
}

const listOf = <T,>(result: PromiseSettledResult<{ data: unknown }>): T[] =>
  result.status === "fulfilled" && Array.isArray(result.value.data) ? (result.value.data as T[]) : [];

const Ministry: React.FC<MinistryProps> = ({ initialSection }) => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const [loading, setLoading] = useState(true);
  const [minister, setMinister] = useState<Minister | null>(null);
  const [tasks, setTasks] = useState<TacheMinistere[]>([]);
  const [taskItems, setTaskItems] = useState<ListeTacheMinistere[]>([]);
  const [structure, setStructure] = useState<StructureAdministrative[]>([]);
  const [procedures, setProcedures] = useState<ProcedureService[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      getMinisters(),
      getTachesMinistere(),
      getListeTaches(),
      getStructureAdministrative(),
      getProceduresServices(),
    ]).then(([m, t, lt, s, ps]) => {
      if (!mounted) return;
      setMinister(listOf<Minister>(m)[0] || null);
      setTasks(listOf<TacheMinistere>(t));
      setTaskItems(listOf<ListeTacheMinistere>(lt));
      setStructure(listOf<StructureAdministrative>(s));
      setProcedures(listOf<ProcedureService>(ps));
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initialSection || loading) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialSection, loading]);

  const titleOf = (item: { titrearabe?: string; titrefrancais?: string }) => pickLang(isArabic, item.titrearabe, item.titrefrancais);
  const htmlOf = (ar?: string | null, fr?: string | null) => (isArabic ? ar || fr : fr || ar) || "";
  const empty = isArabic ? "لا توجد بيانات متاحة حالياً" : "Aucune donnée disponible pour le moment";

  const Empty = () => (
    <p className="py-8 text-center text-gray-500">{loading ? (isArabic ? "جاري التحميل..." : "Chargement…") : empty}</p>
  );

  const ministerImage = mediaUrl(minister?.image);
  const ministerBio = minister ? htmlOf(minister.textarabe, minister.textfrancais) : "";
  const ungroupedItems = taskItems.filter((item) => !tasks.some((task) => task.id === item.tacheid));

  return (
    <div dir={dir} className={dir}>
      <PageHeader title={getTranslation("aboutMinistry", language)} subtitle={getTranslation("heroDescription", language)} />

      {/* Minister */}
      <section className="bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faSpinner} className="mb-4 animate-spin text-4xl text-mauritania-green-dark" />
              <p className="text-gray-600">{getTranslation("loadingMinister", language)}</p>
            </div>
          ) : minister ? (
            <div className="flex flex-col items-center justify-center gap-10 md:flex-row">
              <div className="flex w-full justify-center md:w-1/3">
                {ministerImage ? (
                  <img src={ministerImage} alt={titleOf(minister)} className="h-64 w-64 rounded-lg border-4 border-white object-cover shadow-xl" />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-white shadow-xl">
                    <FontAwesomeIcon icon={faUserTie} className="text-7xl text-mauritania-green-dark/30" />
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="mb-4 text-2xl font-bold text-mauritania-green-dark">{titleOf(minister)}</h3>
                <div className="relative max-h-72 overflow-hidden rounded-lg bg-white p-6 shadow-md">
                  {isEmptyHtml(ministerBio) ? (
                    <p className="italic text-gray-500">{getTranslation("noMinisterData", language)}</p>
                  ) : (
                    <>
                      <RichText html={ministerBio} dir={dir} />
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    </>
                  )}
                </div>
                <Link
                  to="/minister"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-mauritania-green-dark px-5 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-mauritania-green"
                >
                  {getTranslation("readMore", language)}
                  <FontAwesomeIcon icon={faArrowRight} className={isArabic ? "rotate-180" : ""} />
                </Link>
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-white p-6 text-center text-gray-600 shadow-md">{getTranslation("noMinisterData", language)}</p>
          )}
        </div>
      </section>

      {/* Tasks */}
      <section className="scroll-mt-40 bg-white py-10" id="tasks">
        <div className="container mx-auto px-4">
          <SectionTitle title={isArabic ? "المهام" : "Missions"} />
          {tasks.length === 0 && ungroupedItems.length === 0 ? (
            <Empty />
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              {tasks.map((task) => {
                const items = taskItems.filter((item) => item.tacheid === task.id);
                return (
                  <div key={task.id} className="rounded-lg border-s-4 border-mauritania-green bg-gray-50 p-6 shadow-md">
                    <h3 className="mb-3 flex items-start gap-3 font-bold text-mauritania-green-dark">
                      <FontAwesomeIcon icon={faListCheck} className="mt-1" />
                      {titleOf(task)}
                    </h3>
                    {items.length > 0 && (
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li key={item.id} className="flex items-start gap-2 text-gray-700">
                            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-sm text-mauritania-gold" />
                            <span>{titleOf(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              {ungroupedItems.map((item) => (
                <div key={`item-${item.id}`} className="flex items-start gap-3 rounded-lg border-s-4 border-mauritania-green bg-gray-50 p-6 shadow-md">
                  <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-mauritania-gold" />
                  <p className="text-gray-700">{titleOf(item)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Structure */}
      <section className="scroll-mt-40 bg-gray-50 py-10" id="structure">
        <div className="container mx-auto px-4">
          <SectionTitle title={isArabic ? "الهيكلة الإدارية" : "Structure administrative"} />
          {structure.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {structure.map((item) => {
                const text = htmlOf(item.textarabe, item.textfrancais);
                const file = mediaUrl(isArabic ? item.fichierarabe || item.fichierfrancais : item.fichierfrancais || item.fichierarabe);
                return (
                  <div key={item.id} className="flex flex-col rounded-lg border-t-4 border-mauritania-green bg-white p-6 shadow-lg">
                    <h3 className="mb-3 text-xl font-bold text-mauritania-green-dark">{titleOf(item)}</h3>
                    {!isEmptyHtml(text) && <RichText html={text} dir={dir} />}
                    {file && (
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-mauritania-green hover:text-mauritania-gold"
                      >
                        <FontAwesomeIcon icon={faFileDownload} />
                        {isArabic ? "تحميل الملف" : "Télécharger"}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Procedures & services */}
      <section className="scroll-mt-40 bg-gray-50 py-10" id="procedures">
        <div className="container mx-auto px-4">
          <SectionTitle title={isArabic ? "الإجراءات والخدمات" : "Procédures et services"} />
          {procedures.length === 0 ? (
            <Empty />
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6">
              {procedures.map((item) => {
                const text = htmlOf(item.textarabe, item.textfrancais);
                const image = mediaUrl(item.image);
                const file = mediaUrl(item.fichier);
                return (
                  <article key={item.id} className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-md md:flex-row">
                    {image && <img src={image} alt={titleOf(item)} className="h-40 w-full rounded-lg object-cover md:w-56" />}
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold text-mauritania-green-dark">{titleOf(item)}</h3>
                      {!isEmptyHtml(text) && <RichText html={text} dir={dir} />}
                      {file && (
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-mauritania-green hover:text-mauritania-gold"
                        >
                          <FontAwesomeIcon icon={faFileDownload} />
                          {isArabic ? "تحميل الملف" : "Télécharger"}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Ministry;
