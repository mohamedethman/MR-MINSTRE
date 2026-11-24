import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBook,
  faBullhorn,
  faEnvelope,
  faGavel,
  faImages,
  faInfoCircle,
  faList,
  faNewspaper,
  faPhotoVideo,
  faTachometerAlt,
  faThLarge,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { CRUD_SECTIONS } from "./crud/sections";

export interface AdminSection {
  to: string;
  icon: IconDefinition;
  label: { ar: string; fr: string };
  description: { ar: string; fr: string };
  /** Tailwind classes for the dashboard card icon badge. */
  tone: string;
}

/** Every administration section that has a route in App.tsx. Used by the sidebar and the dashboard. */
const BASE_SECTIONS: AdminSection[] = [
  {
    to: "/admin/dashboard",
    icon: faTachometerAlt,
    label: { ar: "لوحة التحكم", fr: "Tableau de bord" },
    description: { ar: "نظرة عامة على أقسام الإدارة", fr: "Vue d'ensemble de l'administration" },
    tone: "bg-mauritania-green/10 text-mauritania-green",
  },
  {
    to: "/admin/home-layout",
    icon: faThLarge,
    label: { ar: "تنظيم الصفحة الرئيسية", fr: "Organisation de l'accueil" },
    description: { ar: "ترتيب أقسام الصفحة الرئيسية وإظهارها أو إخفاؤها", fr: "Ordonner, afficher ou masquer les sections de l'accueil" },
    tone: "bg-emerald-100 text-emerald-600",
  },
  {
    to: "/admin/sliders",
    icon: faImages,
    label: { ar: "السلايدر", fr: "Diaporama" },
    description: { ar: "إضافة وتعديل وحذف صور السلايدر", fr: "Ajouter, modifier et supprimer les diapositives" },
    tone: "bg-sky-100 text-sky-600",
  },
  {
    to: "/admin/ministers",
    icon: faUserTie,
    label: { ar: "الوزارة", fr: "Le ministère" },
    description: { ar: "إضافة وتعديل وحذف بيانات الوزراء", fr: "Ajouter, modifier et supprimer les données du ministre" },
    tone: "bg-mauritania-green/10 text-mauritania-green",
  },
  {
    to: "/admin/news",
    icon: faNewspaper,
    label: { ar: "الأخبار", fr: "Actualités" },
    description: { ar: "إضافة وتعديل وحذف الأخبار", fr: "Ajouter, modifier et supprimer les actualités" },
    tone: "bg-blue-100 text-blue-600",
  },
  {
    to: "/admin/news/categories",
    icon: faList,
    label: { ar: "تصنيفات الأخبار", fr: "Catégories d'actualités" },
    description: { ar: "تنظيم تصنيفات الأخبار", fr: "Organiser les catégories d'actualités" },
    tone: "bg-indigo-100 text-indigo-600",
  },
  {
    to: "/admin/announcements",
    icon: faBullhorn,
    label: { ar: "الإعلانات", fr: "Annonces" },
    description: { ar: "إضافة وتعديل وحذف الإعلانات", fr: "Ajouter, modifier et supprimer les annonces" },
    tone: "bg-yellow-100 text-yellow-600",
  },
  {
    to: "/admin/legislations",
    icon: faGavel,
    label: { ar: "التشريعات", fr: "Législation" },
    description: { ar: "إضافة وتعديل وحذف التشريعات", fr: "Ajouter, modifier et supprimer les textes législatifs" },
    tone: "bg-purple-100 text-purple-600",
  },
  {
    to: "/admin/bibliotheque",
    icon: faPhotoVideo,
    label: { ar: "المكتبة المتعددة الوسائط", fr: "Médiathèque" },
    description: { ar: "إدارة الصور والفيديوهات والملفات", fr: "Gérer les photos, vidéos et fichiers" },
    tone: "bg-pink-100 text-pink-600",
  },
  {
    to: "/admin/bibliotheque/categories",
    icon: faBook,
    label: { ar: "تصنيفات المكتبة", fr: "Catégories de la médiathèque" },
    description: { ar: "تنظيم تصنيفات المكتبة", fr: "Organiser les catégories de la médiathèque" },
    tone: "bg-orange-100 text-orange-600",
  },
  {
    to: "/admin/information",
    icon: faInfoCircle,
    label: { ar: "المعلومات العامة", fr: "Informations générales" },
    description: { ar: "اسم الموقع والشعار ومعلومات الاتصال", fr: "Nom du site, logo et coordonnées" },
    tone: "bg-teal-100 text-teal-600",
  },
  {
    to: "/admin/messages",
    icon: faEnvelope,
    label: { ar: "الرسائل", fr: "Messages" },
    description: { ar: "قراءة رسائل الزوار والرد عليها", fr: "Lire et traiter les messages des visiteurs" },
    tone: "bg-red-100 text-red-600",
  },
];

/* Sections handled by the generic list/form (crud/sections.ts), placed after the related built-in ones. */
const crud = (key: string): AdminSection => {
  const c = CRUD_SECTIONS.find((x) => x.key === key)!;
  return { to: `/admin/${c.key}`, icon: c.icon, label: c.label, description: c.description, tone: c.tone };
};
const insertAfter = (list: AdminSection[], afterPath: string, items: AdminSection[]) => {
  const i = list.findIndex((s) => s.to === afterPath);
  return [...list.slice(0, i + 1), ...items, ...list.slice(i + 1)];
};

/** Every administration section, in sidebar order. Used by the sidebar and the dashboard. */
export const ADMIN_SECTIONS: AdminSection[] = [
  ["/admin/ministers", ["mot-ministre", "taches", "liste-taches", "structure", "projets", "procedures-services", "sous-etablissements"]],
  ["/admin/legislations", ["videos"]],
  ["/admin/information", ["reseaux-sociaux"]],
].reduce<AdminSection[]>((list, [after, keys]) => insertAfter(list, after as string, (keys as string[]).map(crud)), BASE_SECTIONS);

/** The section whose path best matches the current location (longest prefix wins). */
export const activeSectionPath = (pathname: string): string | undefined =>
  ADMIN_SECTIONS.map((s) => s.to)
    .filter((to) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.length - a.length)[0];
