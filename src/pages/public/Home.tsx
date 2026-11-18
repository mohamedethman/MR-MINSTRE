import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBullhorn,
  faBuilding,
  faCalendarAlt,
  faImages,
  faNewspaper,
  faPlayCircle,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { Actualite, Announcement, Minister } from "../../types/types";
import { getAnnouncements, getMinisters, getNews } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const fallbackMinisterImage = "https://via.placeholder.com/250x300/007a45/FFFFFF?text=وزير+العقارات";

const Home: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [minister, setMinister] = useState<Minister | null>(null);
  const [news, setNews] = useState<Actualite[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos">("photos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getMinisters(), getNews(), getAnnouncements()]).then((results) => {
      if (!mounted) return;
      const [ministerResult, newsResult, announcementResult] = results;
      if (ministerResult.status === "fulfilled" && ministerResult.value.data?.length) setMinister(ministerResult.value.data[0]);
      if (newsResult.status === "fulfilled" && Array.isArray(newsResult.value.data)) setNews(newsResult.value.data.slice(0, 3));
      if (announcementResult.status === "fulfilled" && Array.isArray(announcementResult.value.data)) setAnnouncements(announcementResult.value.data.slice(0, 3));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const copy = isArabic ? {
    minister: "معالي الوزير", nameLabel: "الاسم واللقب", nameFallback: "مامودو مامادو انيانغ",
    bio: "السيرة الذاتية للوزير", readBio: "قراءة السيرة الذاتية كاملة",
    latest: "آخر الأخبار", moreNews: "المزيد من الأخبار", ministryNews: "أخبار الوزارة", noNews: "لا توجد أخبار حالياً",
    media: "الصور والفيديوهات", photos: "الصور", videos: "الفيديوهات", noPhotos: "لا توجد صور متاحة", noVideos: "لا توجد فيديوهات متاحة", allMedia: "عرض جميع الصور",
    ads: "الإعلانات", noAds: "لا توجد إعلانات متاحة", moreAds: "المزيد من الإعلانات",
    institutions: "المؤسسات تحت الوصاية", noInstitutions: "لا توجد مؤسسات تحت الوصاية", institutionsSoon: "سيتم إضافة المؤسسات تحت الوصاية قريباً. شكراً لتفهمكم.",
  } : {
    minister: "Son Excellence le Ministre", nameLabel: "Nom et prénom", nameFallback: "Mamoudou Mamadou Niang",
    bio: "Biographie du ministre", readBio: "Lire la biographie complète",
    latest: "Dernières actualités", moreNews: "Toutes les actualités", ministryNews: "Actualités du ministère", noNews: "Aucune actualité pour le moment",
    media: "Photos et vidéos", photos: "Photos", videos: "Vidéos", noPhotos: "Aucune photo disponible", noVideos: "Aucune vidéo disponible", allMedia: "Voir toutes les photos",
    ads: "Annonces", noAds: "Aucune annonce disponible", moreAds: "Toutes les annonces",
    institutions: "Établissements sous tutelle", noInstitutions: "Aucun établissement sous tutelle", institutionsSoon: "Les établissements sous tutelle seront ajoutés prochainement. Merci de votre compréhension.",
  };
  const titleOf = (item: { titrearabe: string; titrefrancais: string }) => isArabic ? item.titrearabe : item.titrefrancais;
  const textOf = (item: { textarabe?: string; textfrancais?: string }) => stripHtml((isArabic ? item.textarabe : item.textfrancais) || "");
  const dateOf = (value?: string) => value ? new Date(value).toLocaleDateString(isArabic ? "ar-MR" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
  const arrow = isArabic ? faArrowLeft : faArrowRight;
  const ministerName = (minister ? titleOf(minister) : "") || copy.nameFallback;
  const ministerDisplayName = ministerName.startsWith(`${copy.nameLabel}:`)
    ? ministerName
    : `${copy.nameLabel}: ${ministerName}`;
  const ministerBio = minister ? textOf(minister) : "";
  const ministerImage = typeof minister?.image === "string" && minister.image.trim()
    ? /^(data:|https?:\/\/|\/)/i.test(minister.image)
      ? minister.image
      : `data:image/jpeg;base64,${minister.image}`
    : fallbackMinisterImage;

  const SectionHeading = ({ icon, title }: { icon: typeof faNewspaper; title: string }) => (
    <div className="mb-12">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mauritania-green-dark shadow-lg">
          <FontAwesomeIcon icon={icon} className="text-2xl text-mauritania-gold" />
        </div>
        <h2 className="text-3xl font-bold text-mauritania-green-dark md:text-4xl">{title}</h2>
      </div>
      <div className="relative h-1 w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-mauritania-gold to-transparent" />
        </div>
        <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-mauritania-gold" />
      </div>
    </div>
  );

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className={`${isArabic ? "rtl" : "ltr"} bg-[#f8faf8] text-gray-800`}>
      <section className="overflow-hidden bg-white px-4 py-8 sm:px-8" id="ministry">
        <div className="container mx-auto">
          <div className="mb-8 grid grid-cols-1 gap-8 transition-all duration-700 delay-300 lg:grid-cols-10">
            <div className="h-full w-full lg:col-span-7">
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                <div className="flex flex-shrink-0 items-center justify-between bg-mauritania-green-dark p-4 text-white">
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <FontAwesomeIcon icon={faUserTie} className="text-mauritania-gold" />
                    {copy.bio}
                  </h3>
                </div>
                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-4 flex h-full flex-col items-start gap-6 md:flex-row">
                    <div className="w-full flex-shrink-0 md:w-1/3">
                      <img
                        src={ministerImage}
                        alt={ministerDisplayName}
                        className="h-64 w-full rounded-xl border-4 border-mauritania-gold object-cover shadow-md"
                      />
                      <div className="mt-4 text-center">
                        <h4 className="text-lg font-bold text-mauritania-green-dark">
                          {ministerDisplayName}
                        </h4>
                        <span className="mt-1 inline-block rounded-full bg-mauritania-gold px-2 py-1 text-xs font-medium text-white">
                          {copy.minister}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-full w-full flex-col md:w-2/3">
                      <div className="relative mb-6 max-h-96 overflow-hidden text-justify text-sm leading-relaxed text-gray-600">
                        {ministerBio && <p className="whitespace-pre-line">{ministerBio}</p>}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                      </div>
                      <div className="mt-auto text-right">
                        <Link
                          to="/minister"
                          className="inline-flex items-center font-bold text-mauritania-green transition-colors hover:text-mauritania-gold"
                        >
                          <span>{copy.readBio}</span>
                          <FontAwesomeIcon icon={arrow} className="mx-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="h-full w-full lg:col-span-3">
              <aside className="flex h-full flex-col overflow-hidden rounded-xl bg-white pb-6 shadow-lg">
                <div className="mb-4 flex flex-shrink-0 items-center justify-between bg-mauritania-gold p-4 text-mauritania-green-dark">
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <FontAwesomeIcon icon={faNewspaper} className="text-white" />
                    {copy.latest}
                  </h3>
                  <Link
                    to="/news"
                    className="flex items-center gap-1 text-sm font-bold text-white transition-colors hover:text-mauritania-green-dark"
                  >
                    {copy.moreNews}
                    <FontAwesomeIcon icon={arrow} />
                  </Link>
                </div>
                <div className="flex flex-grow flex-col px-4">
                  {news.length > 0 && (
                    <div className="space-y-3">
                      {news.map((item) => (
                        <Link
                          key={item.id}
                          to={`/news/${item.id}`}
                          className="block border-s-4 border-mauritania-green bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <p className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {dateOf(item.datepublication)}
                          </p>
                          <h4 className="font-bold text-mauritania-green-dark">{titleOf(item)}</h4>
                        </Link>
                      ))}
                    </div>
                  )}
                  {news.length === 0 && loading && (
                    <p className="py-4 text-center text-sm text-gray-500">
                      {isArabic ? "جاري التحميل..." : "Chargement…"}
                    </p>
                  )}
                  <div className="flex-grow" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

        <section className="overflow-hidden bg-[#f8faf8] px-4 py-8 sm:px-8" id="news">
          <div className="container mx-auto">
            <SectionHeading icon={faNewspaper} title={copy.ministryNews} />
            {news.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {news.map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="border-s-2 border-mauritania-gold bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <p className="mb-2 text-xs text-gray-500">{dateOf(item.datepublication)}</p>
                    <h3 className="font-bold leading-6 text-mauritania-green-dark">{titleOf(item)}</h3>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-gray-600">
                {loading ? (isArabic ? "جاري التحميل..." : "Chargement…") : copy.noNews}
              </p>
            )}
            <div className="mt-12 text-center">
              <Link
                to="/news"
                className="group inline-flex items-center rounded bg-mauritania-gold px-8 py-3 font-semibold text-mauritania-green-dark transition duration-300 hover:scale-105 hover:bg-yellow-600 hover:shadow-lg"
              >
                {copy.moreNews}
                <FontAwesomeIcon icon={arrow} className="ml-2 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-white px-4 py-8 sm:px-8" id="media">
          <div className="container mx-auto">
            <SectionHeading icon={faImages} title={copy.media} />
            <div className="mb-8 flex justify-center">
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-200">
                {(["photos", "videos"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMediaTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                      mediaTab === tab
                        ? "bg-mauritania-green-dark text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={tab === "photos" ? faImages : faPlayCircle} className="ml-2" />
                    {tab === "photos" ? copy.photos : copy.videos}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-12 text-center text-gray-600">
              <FontAwesomeIcon
                icon={mediaTab === "photos" ? faImages : faPlayCircle}
                className="mb-4 text-4xl text-gray-400"
              />
              <p>{mediaTab === "photos" ? copy.noPhotos : copy.noVideos}</p>
            </div>
            {mediaTab === "photos" && (
              <div className="mt-12 text-center">
                <Link
                  to="/news"
                  className="group inline-flex items-center rounded bg-mauritania-gold px-8 py-3 font-semibold text-mauritania-green-dark transition duration-300 hover:scale-105 hover:bg-yellow-600 hover:shadow-lg"
                >
                  {copy.allMedia}
                  <FontAwesomeIcon icon={arrow} className="ml-2 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden bg-mauritania-green-dark px-4 py-8 text-white sm:px-8" id="announcements">
          <div className="container mx-auto">
            <div className="relative mb-12 text-center">
              <div className="mb-4 flex items-center justify-center">
                <FontAwesomeIcon icon={faBullhorn} className="mr-3 text-4xl text-mauritania-gold" />
                <h2 className="inline-block pb-2 text-3xl font-bold text-mauritania-gold">{copy.ads}</h2>
              </div>
              <div className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 bg-mauritania-gold" />
            </div>
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
                    <h3 className="font-bold">{titleOf(item)}</h3>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-mauritania-gold">
                {loading ? (isArabic ? "جاري التحميل..." : "Chargement…") : copy.noAds}
              </p>
            )}
            <div className="mt-12 text-center">
              <Link
                to="/announcements"
                className="group inline-flex items-center rounded bg-mauritania-gold px-8 py-3 font-semibold text-mauritania-green-dark transition duration-300 hover:scale-105 hover:bg-yellow-600 hover:shadow-lg"
              >
                {copy.moreAds}
                <FontAwesomeIcon icon={arrow} className="ml-2 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f8faf8] px-4 py-8 sm:px-8" id="sous-etablissements">
          <div className="container mx-auto">
            <SectionHeading icon={faBuilding} title={copy.institutions} />
            <div className="mx-auto max-w-2xl rounded-xl bg-white py-12 text-center shadow-lg">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                <FontAwesomeIcon icon={faBuilding} className="text-3xl text-gray-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-700">{copy.noInstitutions}</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-500">{copy.institutionsSoon}</p>
              <div className="mx-auto h-1 w-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
          </div>
        </section>
        <div id="tasks" />
    </div>
  );
};

export default Home;
