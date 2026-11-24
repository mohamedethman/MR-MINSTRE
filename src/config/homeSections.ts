/**
 * Home page sections.
 *
 * Order and visibility are managed from the admin page "Organisation de
 * l'accueil" (/admin/home-layout) and stored through /api/menu, so they apply
 * to every visitor. HOME_SECTIONS below is the default layout, used until an
 * admin saves one or if the API cannot be reached.
 */
export type HomeSectionId =
  | "ministerAndLatest" // Minister biography + "Dernières actualités" sidebar
  | "news" // "Actualités du ministère" cards
  | "media" // "Photos et vidéos" tabs
  | "announcements" // "Annonces"
  | "institutions"; // "Établissements sous tutelle"

export interface HomeSectionConfig {
  id: HomeSectionId;
  visible: boolean;
}

/** Default layout, top to bottom. */
export const HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "ministerAndLatest", visible: true },
  { id: "news", visible: true },
  { id: "media", visible: true },
  { id: "announcements", visible: true },
  { id: "institutions", visible: true },
];

/** Names shown in the admin page (and stored as the menu row names). */
export const HOME_SECTION_LABELS: Record<HomeSectionId, { ar: string; fr: string }> = {
  ministerAndLatest: { ar: "السيرة الذاتية للوزير وآخر الأخبار", fr: "Biographie du ministre et dernières actualités" },
  news: { ar: "أخبار الوزارة", fr: "Actualités du ministère" },
  media: { ar: "الصور والفيديوهات", fr: "Photos et vidéos" },
  announcements: { ar: "الإعلانات", fr: "Annonces" },
  institutions: { ar: "المؤسسات تحت الوصاية", fr: "Établissements sous tutelle" },
};
