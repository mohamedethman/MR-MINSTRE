import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faImages, faProjectDiagram, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Projet } from "../../types/types";
import { getProjets } from "../../services/api";
import { useCachedApi } from "../../services/cache";
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import { mediaUrl, pickLang, stripHtml } from "../../utils/content";

/** Public list of the ministry's projects (/projects). */
const Projects: React.FC = () => {
  const { t, isArabic, dir } = useT();
  const { data, loading } = useCachedApi<Projet[]>("/projets", getProjets);
  const [search, setSearch] = useState("");
  const arrow = isArabic ? faArrowLeft : faArrowRight;

  const projects = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      [p.titrearabe, p.titrefrancais, stripHtml(p.descarabe), stripHtml(p.descfrancais)].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <PageHeader
        icon={faProjectDiagram}
        title={t("المشاريع", "Projets")}
        subtitle={t("مشاريع الوزارة لتطوير القطاع العقاري وأملاك الدولة", "Les projets du ministère pour le développement du foncier et du patrimoine de l'État")}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-6 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ابحث عن مشروع...", "Rechercher un projet…")}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pe-3 ps-10 focus:outline-none focus:ring-2 focus:ring-mauritania-green"
          />
        </div>

        {loading && projects.length === 0 ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <p className="rounded-lg bg-white py-12 text-center text-gray-600 shadow-sm">
            {search ? t("لا توجد نتائج مطابقة", "Aucun résultat") : t("لا توجد مشاريع حالياً", "Aucun projet pour le moment")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const title = pickLang(isArabic, project.titrearabe, project.titrefrancais);
              const excerpt = stripHtml(isArabic ? project.descarabe || project.descfrancais : project.descfrancais || project.descarabe);
              const cover = mediaUrl(project.images?.[0]?.image);
              const count = project.images?.length || 0;
              return (
                <article key={project.id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Link to={`/projects/${project.id}`} className="relative block aspect-video overflow-hidden bg-gray-100" aria-label={title}>
                    {cover ? (
                      <img src={cover} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                        <FontAwesomeIcon icon={faProjectDiagram} />
                      </span>
                    )}
                    {count > 1 && (
                      <span className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                        <FontAwesomeIcon icon={faImages} />
                        {count}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="mb-2 line-clamp-2 text-lg font-bold text-mauritania-green-dark" title={title}>
                      <Link to={`/projects/${project.id}`} className="hover:underline">
                        {title}
                      </Link>
                    </h2>
                    {excerpt && <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-600">{excerpt}</p>}
                    <Link
                      to={`/projects/${project.id}`}
                      className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-mauritania-green hover:text-mauritania-green-dark"
                    >
                      {t("تفاصيل المشروع", "Voir le projet")}
                      <FontAwesomeIcon icon={arrow} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
