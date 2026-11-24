import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBuilding,
  faCalendarAlt,
  faExternalLinkAlt,
  faImages,
  faNewspaper,
  faPlayCircle,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { Actualite, Announcement, Minister, SousEtablissement, Video } from "../../types/types";
import { getAnnouncements, getMenus, getMinisters, getNews, getSousEtablissements, getVideos } from "../../services/api";
import { useT } from "../../i18n";
import RichText from "../../components/RichText";
import { isEmptyHtml, mediaUrl, pickLang } from "../../utils/content";
import { useCachedApi } from "../../services/cache";
import Spinner from "../../components/Spinner";
import SectionTitle from "../../components/SectionTitle";
import { HomeSectionId } from "../../config/homeSections";
import { resolveHomeLayout } from "../../services/homeLayout";

const asList = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const byDateDesc = <T extends { datepublication?: string }>(items: T[]) =>
  [...items].sort((a, b) => (b.datepublication || "").localeCompare(a.datepublication || ""));

const Home: React.FC = () => {
  const { t, isArabic, dir, formatDate } = useT();
  const [mediaTab, setMediaTab] = useState<"photos" | "videos">("photos");

  // Each section reads through the smart cache: instant on repeat visits,
  // refreshed in the background, and re-rendered when fresh data arrives.
  const ministerQuery = useCachedApi<Minister[]>("/aproposministere", getMinisters);
  const newsQuery = useCachedApi<Actualite[]>("/actualites", getNews);
  const announcementQuery = useCachedApi<Announcement[]>("/annonces", getAnnouncements);
  const institutionQuery = useCachedApi<SousEtablissement[]>("/sousetablissements", getSousEtablissements);
  const videoQuery = useCachedApi<Video[]>("/videos", getVideos);
  // Section order/visibility set in the admin "Organisation de l'accueil" page (defaults if none saved).
  const layoutQuery = useCachedApi<unknown>("/menu", getMenus);
  const layout = useMemo(() => resolveHomeLayout(layoutQuery.data), [layoutQuery.data]);

  const minister = asList<Minister>(ministerQuery.data)[0] || null;
  const news = useMemo(() => byDateDesc(asList<Actualite>(newsQuery.data)), [newsQuery.data]);
  const announcements = useMemo(() => byDateDesc(asList<Announcement>(announcementQuery.data)).slice(0, 3), [announcementQuery.data]);
  const institutions = asList<SousEtablissement>(institutionQuery.data);
  const videos = asList<Video>(videoQuery.data);
  const loading = [ministerQuery, newsQuery, announcementQuery, institutionQuery, videoQuery].some((q) => q.loading);
  // First visit with nothing cached yet: show one page spinner instead of empty sections.
  // The layout is awaited too, so sections never jump to a new order after painting.
  const firstLoad = (ministerQuery.loading && newsQuery.loading) || layoutQuery.loading;

  const copy = {
    minister: t("معالي الوزير", "Son Excellence le Ministre"),
    bio: t("السيرة الذاتية للوزير", "Biographie du ministre"),
    readBio: t("قراءة السيرة الذاتية كاملة", "Lire la biographie complète"),
    noBio: t("لا تتوفر السيرة الذاتية حالياً", "Biographie non disponible pour le moment"),
    latest: t("آخر الأخبار", "Dernières actualités"),
    moreNews: t("المزيد من الأخبار", "Toutes les actualités"),
    ministryNews: t("أخبار الوزارة", "Actualités du ministère"),
    noNews: t("لا توجد أخبار حالياً", "Aucune actualité pour le moment"),
    media: t("الصور والفيديوهات", "Photos et vidéos"),
    photos: t("الصور", "Photos"),
    videos: t("الفيديوهات", "Vidéos"),
    noPhotos: t("لا توجد صور متاحة", "Aucune photo disponible"),
    noVideos: t("لا توجد فيديوهات متاحة", "Aucune vidéo disponible"),
    allMedia: t("عرض جميع الصور", "Voir toutes les photos"),
    ads: t("الإعلانات", "Annonces"),
    noAds: t("لا توجد إعلانات متاحة", "Aucune annonce disponible"),
    moreAds: t("المزيد من الإعلانات", "Toutes les annonces"),
    institutions: t("المؤسسات تحت الوصاية", "Établissements sous tutelle"),
    noInstitutions: t("لا توجد مؤسسات تحت الوصاية", "Aucun établissement sous tutelle"),
    visit: t("زيارة الموقع", "Visiter le site"),
    loading: t("جاري التحميل...", "Chargement…"),
  };

  const titleOf = (item: { titrearabe?: string; titrefrancais?: string }) => pickLang(isArabic, item.titrearabe, item.titrefrancais);
  const dateOf = (value?: string) => formatDate(value);
  const arrow = isArabic ? faArrowLeft : faArrowRight;

  const ministerName = minister ? titleOf(minister) : "";
  const ministerBio = minister ? (isArabic ? minister.textarabe || minister.textfrancais : minister.textfrancais || minister.textarabe) : "";
  const ministerImage = mediaUrl(minister?.image);
  const photos = news
    .map((item) => ({ id: item.id, title: titleOf(item), src: mediaUrl(item.image) }))
    .filter((item): item is { id: number | undefined; title: string; src: string } => Boolean(item.src))
    .slice(0, 6);

  const Empty = ({ text, light }: { text: string; light?: boolean }) =>
    loading ? (
      <Spinner label={copy.loading} className={light ? "!text-mauritania-gold" : ""} />
    ) : (
      <p className={`py-12 text-center ${light ? "text-mauritania-gold" : "text-gray-600"}`}>{text}</p>
    );

  const MoreButton = ({ to, label }: { to: string; label: string }) => (
    <div className="mt-12 text-center">
      <Link
        to={to}
        className="group inline-flex items-center gap-2 rounded bg-mauritania-gold px-8 py-3 font-semibold text-mauritania-green-dark transition duration-300 hover:scale-105 hover:bg-yellow-500 hover:shadow-lg"
      >
        {label}
        <FontAwesomeIcon icon={arrow} />
      </Link>
    </div>
  );

  if (firstLoad) {
    return (
      <div dir={dir} className="bg-[#f8faf8]">
        <Spinner variant="page" label={copy.loading} />
      </div>
    );
  }

  // One renderer per section; `layout` decides their order and visibility.
  const sections: Record<HomeSectionId, () => React.ReactNode> = {
    ministerAndLatest: () => (
      <section className="overflow-hidden bg-white px-4 py-8 sm:px-8" id="ministry">
        <div className="container mx-auto">
          <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-10">
            <div className="h-full w-full lg:col-span-7">
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                <div className="flex flex-shrink-0 items-center justify-between bg-mauritania-green-dark p-4 text-white">
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <FontAwesomeIcon icon={faUserTie} className="text-mauritania-gold" />
                    {copy.bio}
                  </h3>
                </div>
                <div className="flex flex-grow flex-col p-6">
                  {minister ? (
                    <div className="mb-4 flex h-full flex-col items-start gap-6 md:flex-row">
                      <div className="w-full flex-shrink-0 md:w-1/3">
                        {ministerImage ? (
                          <img
                            src={ministerImage}
                            alt={ministerName}
                            className="h-64 w-full rounded-xl border-4 border-mauritania-gold object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-64 w-full items-center justify-center rounded-xl border-4 border-mauritania-gold bg-mauritania-green-dark/5">
                            <FontAwesomeIcon icon={faUserTie} className="text-6xl text-mauritania-green-dark/40" />
                          </div>
                        )}
                        <div className="mt-4 text-center">
                          {ministerName && <h4 className="text-lg font-bold text-mauritania-green-dark">{ministerName}</h4>}
                          <span className="mt-1 inline-block rounded-full bg-mauritania-gold px-2 py-1 text-xs font-medium text-mauritania-green-dark">
                            {copy.minister}
                          </span>
                        </div>
                      </div>
                      <div className="flex h-full w-full flex-col md:w-2/3">
                        {isEmptyHtml(ministerBio) ? (
                          <p className="mb-6 text-sm italic text-gray-500">{copy.noBio}</p>
                        ) : (
                          <div className="relative mb-6 max-h-96 overflow-hidden">
                            <RichText html={ministerBio} dir={dir} className="rich-text-sm" />
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                          </div>
                        )}
                        <div className="mt-auto text-end">
                          <Link
                            to="/minister"
                            className="inline-flex items-center gap-2 font-bold text-mauritania-green transition-colors hover:text-mauritania-gold"
                          >
                            <span>{copy.readBio}</span>
                            <FontAwesomeIcon icon={arrow} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty text={copy.noBio} />
                  )}
                </div>
              </article>
            </div>

            <div className="h-full w-full lg:col-span-3">
              <aside className="flex h-full flex-col overflow-hidden rounded-xl bg-white pb-6 shadow-lg">
                <div className="mb-4 flex flex-shrink-0 items-center justify-between gap-2 bg-mauritania-gold p-4 text-mauritania-green-dark">
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <FontAwesomeIcon icon={faNewspaper} />
                    {copy.latest}
                  </h3>
                  <Link to="/news" className="flex items-center gap-1 text-sm font-bold transition-colors hover:text-white">
                    {copy.moreNews}
                    <FontAwesomeIcon icon={arrow} />
                  </Link>
                </div>
                <div className="flex flex-grow flex-col px-4">
                  {news.length > 0 ? (
                    <div className="space-y-3">
                      {news.slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="block border-s-4 border-mauritania-green bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <p className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {dateOf(item.datepublication)}
                          </p>
                          <h4 className="line-clamp-2 font-bold text-mauritania-green-dark" title={titleOf(item)}>{titleOf(item)}</h4>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Empty text={copy.noNews} />
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    ),
    news: () => (
      <section className="overflow-hidden bg-[#f8faf8] px-4 py-8 sm:px-8" id="news">
        <div className="container mx-auto">
          <SectionTitle title={copy.ministryNews} />
          {news.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {news.slice(0, 3).map((item) => {
                const image = mediaUrl(item.image);
                return (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl"
                  >
                    {image && (
                      <img src={image} alt={titleOf(item)} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="border-s-4 border-mauritania-gold p-4">
                      <p className="mb-2 text-xs text-gray-500">{dateOf(item.datepublication)}</p>
                      <h3 className="line-clamp-2 font-bold leading-6 text-mauritania-green-dark" title={titleOf(item)}>{titleOf(item)}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Empty text={copy.noNews} />
          )}
          <MoreButton to="/news" label={copy.moreNews} />
        </div>
      </section>
    ),
    media: () => (
      <section className="overflow-hidden bg-white px-4 py-8 sm:px-8" id="media">
        <div className="container mx-auto">
          <SectionTitle title={copy.media} />
          <div className="mb-8 flex justify-center">
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200">
              {(["photos", "videos"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMediaTab(tab)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    mediaTab === tab ? "bg-mauritania-green-dark text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FontAwesomeIcon icon={tab === "photos" ? faImages : faPlayCircle} />
                  {tab === "photos" ? copy.photos : copy.videos}
                </button>
              ))}
            </div>
          </div>

          {mediaTab === "photos" &&
            (photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {photos.map((photo) => (
                  <Link key={photo.id} to={`/news/${photo.id}`} className="group relative block overflow-hidden rounded-lg">
                    <img src={photo.src} alt={photo.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold text-white">
                      {photo.title}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty text={copy.noPhotos} />
            ))}

          {mediaTab === "videos" &&
            (videos.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {videos.map((video) => {
                  const file = mediaUrl(video.fichier);
                  const description = pickLang(isArabic, video.descarabe, video.descfrancais);
                  return (
                    <div key={video.id} className="overflow-hidden rounded-xl bg-white shadow-md">
                      {file ? (
                        <video src={file} controls preload="metadata" className="h-52 w-full bg-black object-cover" />
                      ) : video.lien ? (
                        <a
                          href={video.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-52 w-full items-center justify-center bg-mauritania-green-dark text-5xl text-mauritania-gold"
                        >
                          <FontAwesomeIcon icon={faPlayCircle} />
                        </a>
                      ) : null}
                      <div className="p-4">
                        <h3 className="font-bold text-mauritania-green-dark">{titleOf(video)}</h3>
                        {!isEmptyHtml(description) && <div className="mt-2 line-clamp-3"><RichText html={description} dir={dir} className="rich-text-sm" /></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty text={copy.noVideos} />
            ))}

          {mediaTab === "photos" && photos.length > 0 && <MoreButton to="/news" label={copy.allMedia} />}
        </div>
      </section>
    ),
    announcements: () => (
      <section className="overflow-hidden bg-mauritania-green-dark px-4 py-8 text-white sm:px-8" id="announcements">
        <div className="container mx-auto">
          <SectionTitle title={copy.ads} light />
          {announcements.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {announcements.map((item) => (
                <Link
                  key={item.id}
                  to={`/announcements/${item.id}`}
                  className="flex flex-col rounded-xl border border-white/20 bg-white/10 p-5 transition-colors hover:bg-white/20"
                >
                  <p className="mb-2 flex items-center gap-2 text-sm text-mauritania-gold">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {dateOf(item.datepublication)}
                  </p>
                  <h3 className="line-clamp-3 font-bold" title={titleOf(item)}>{titleOf(item)}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <Empty text={copy.noAds} light />
          )}
          <MoreButton to="/announcements" label={copy.moreAds} />
        </div>
      </section>
    ),
    institutions: () => (
      <section className="overflow-hidden bg-[#f8faf8] px-4 py-8 sm:px-8" id="sous-etablissements">
        <div className="container mx-auto">
          <SectionTitle title={copy.institutions} />
          {institutions.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {institutions.map((item) => {
                const logo = mediaUrl(item.logo);
                const description = pickLang(isArabic, item.descarabe, item.descfrancais);
                return (
                  <div key={item.id} className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-md">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {logo ? (
                        <img src={logo} alt={titleOf(item)} className="h-full w-full object-contain" />
                      ) : (
                        <FontAwesomeIcon icon={faBuilding} className="text-3xl text-gray-400" />
                      )}
                    </div>
                    <h3 className="mb-2 font-bold text-mauritania-green-dark">{titleOf(item)}</h3>
                    {!isEmptyHtml(description) && <div className="line-clamp-4"><RichText html={description} dir={dir} className="rich-text-sm text-center" /></div>}
                    {item.lien && (
                      <a
                        href={item.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-mauritania-green hover:text-mauritania-gold"
                      >
                        {copy.visit}
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty text={copy.noInstitutions} />
          )}
        </div>
      </section>
    ),
  };

  return (
    // The first visible section sits closer to the header.
    <div dir={dir} className={`${dir} bg-[#f8faf8] text-gray-800 [&>section:first-child]:pt-4`}>
      {layout.filter((section) => section.visible).map((section) => (
        <React.Fragment key={section.id}>{sections[section.id]()}</React.Fragment>
      ))}
    </div>
  );
};

export default Home;
