import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronLeft, faChevronRight, faExternalLinkAlt, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
import { Projet } from "../../types/types";
import { getProjets } from "../../services/api";
import { useCachedApi } from "../../services/cache";
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import RichText from "../../components/RichText";
import { isEmptyHtml, mediaUrl, openMedia, pickLang } from "../../utils/content";

/** One project with its image gallery (/projects/:id). */
const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isArabic, dir } = useT();
  const { data, loading } = useCachedApi<Projet[]>("/projets", getProjets);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [id]);

  const project = (Array.isArray(data) ? data : []).find((p) => String(p.id) === id);

  if (!project) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50">
        {loading ? (
          <Spinner variant="page" />
        ) : (
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="mb-6 text-xl text-gray-600">{t("المشروع غير موجود", "Projet introuvable")}</p>
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-lg bg-mauritania-green-dark px-5 py-2.5 font-semibold text-white">
              <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
              {t("العودة إلى المشاريع", "Retour aux projets")}
            </Link>
          </div>
        )}
      </div>
    );
  }

  const title = pickLang(isArabic, project.titrearabe, project.titrefrancais);
  const description = (isArabic ? project.descarabe || project.descfrancais : project.descfrancais || project.descarabe) || "";
  const images = (project.images || []).map((img) => img.image).filter((img) => mediaUrl(img));
  const current = images[Math.min(index, images.length - 1)];
  const step = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <PageHeader
        title={title}
        crumbs={[{ label: t("المشاريع", "Projets"), to: "/projects" }]}
        actions={
          project.lien ? (
            <a
              href={project.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-mauritania-green px-4 py-2 text-sm font-semibold text-white hover:bg-mauritania-green-dark"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              {t("موقع المشروع", "Site du projet")}
            </a>
          ) : undefined
        }
      />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <article className="overflow-hidden rounded-xl bg-white shadow-sm">
          {current ? (
            <div className="bg-gray-50 p-4 md:p-6">
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => openMedia(current)}
                  title={t("عرض الصورة بالحجم الكامل", "Voir l'image en taille réelle")}
                  className="block cursor-zoom-in"
                >
                  <img src={mediaUrl(current) || undefined} alt={title} className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-sm" />
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={t("الصورة السابقة", "Image précédente")}
                      className="absolute start-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-mauritania-green-dark shadow hover:bg-white"
                    >
                      <FontAwesomeIcon icon={isArabic ? faChevronRight : faChevronLeft} />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={t("الصورة التالية", "Image suivante")}
                      className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-mauritania-green-dark shadow hover:bg-white"
                    >
                      <FontAwesomeIcon icon={isArabic ? faChevronLeft : faChevronRight} />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`${t("صورة", "Image")} ${i + 1}`}
                      aria-current={i === index}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                        i === index ? "border-mauritania-gold" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={mediaUrl(img) || undefined} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-50 text-5xl text-gray-300">
              <FontAwesomeIcon icon={faProjectDiagram} />
            </div>
          )}

          <div className="p-6 md:p-8">
            {isEmptyHtml(description) ? (
              <p className="italic text-gray-500">{t("لا يوجد وصف لهذا المشروع.", "Aucune description pour ce projet.")}</p>
            ) : (
              <RichText html={description} dir={dir} className="text-lg" />
            )}
          </div>
        </article>

        <div className="mt-6">
          <Link to="/projects" className="inline-flex items-center gap-2 font-semibold text-mauritania-green hover:text-mauritania-green-dark">
            <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
            {t("العودة إلى المشاريع", "Retour aux projets")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
