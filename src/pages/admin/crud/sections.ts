import {
  faBuilding,
  faCommentDots,
  faFileSignature,
  faListCheck,
  faListUl,
  faProjectDiagram,
  faShareNodes,
  faSitemap,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { CrudSection, FieldDef } from "./types";

/* Reusable field pairs (Arabic content is always RTL, French content LTR). */
const titles: FieldDef[] = [
  { name: "titrearabe", label: { ar: "العنوان بالعربية", fr: "Titre en arabe" }, type: "text", dir: "rtl", required: true },
  { name: "titrefrancais", label: { ar: "العنوان بالفرنسية", fr: "Titre en français" }, type: "text", dir: "ltr", required: true },
];
const richTexts: FieldDef[] = [
  { name: "textarabe", label: { ar: "النص بالعربية", fr: "Texte en arabe" }, type: "richtext", dir: "rtl", wide: true },
  { name: "textfrancais", label: { ar: "النص بالفرنسية", fr: "Texte en français" }, type: "richtext", dir: "ltr", wide: true },
];
const richDescs: FieldDef[] = [
  { name: "descarabe", label: { ar: "الوصف بالعربية", fr: "Description en arabe" }, type: "richtext", dir: "rtl", wide: true },
  { name: "descfrancais", label: { ar: "الوصف بالفرنسية", fr: "Description en français" }, type: "richtext", dir: "ltr", wide: true },
];
const titleColumns = [
  { name: "titrearabe", label: { ar: "العنوان (عربي)", fr: "Titre (arabe)" }, dir: "rtl" as const },
  { name: "titrefrancais", label: { ar: "العنوان (فرنسي)", fr: "Titre (français)" }, dir: "ltr" as const },
];
const link: FieldDef = { name: "lien", label: { ar: "الرابط", fr: "Lien" }, type: "url" };

/**
 * Admin sections built on the generic list/form (see CrudList / CrudForm).
 * Endpoints and payloads follow backend/Apiurl.txt.
 */
export const CRUD_SECTIONS: CrudSection[] = [
  {
    key: "sous-etablissements",
    endpoint: "/sousetablissements",
    icon: faBuilding,
    label: { ar: "المؤسسات تحت الوصاية", fr: "Établissements sous tutelle" },
    itemLabel: { ar: "مؤسسة", fr: "établissement" },
    description: { ar: "إدارة المؤسسات التابعة لوصاية الوزارة", fr: "Gérer les établissements sous tutelle du ministère" },
    tone: "bg-emerald-100 text-emerald-700",
    fields: [
      { name: "logo", label: { ar: "الشعار", fr: "Logo" }, type: "image", wide: true },
      ...titles,
      ...richDescs,
      link,
    ],
    columns: [
      { name: "logo", label: { ar: "الشعار", fr: "Logo" }, type: "image" },
      ...titleColumns,
      { name: "lien", label: { ar: "الرابط", fr: "Lien" }, type: "link" },
    ],
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "projets",
    endpoint: "/projets",
    icon: faProjectDiagram,
    label: { ar: "المشاريع", fr: "Projets" },
    itemLabel: { ar: "مشروع", fr: "projet" },
    description: { ar: "إضافة وتعديل وحذف مشاريع الوزارة", fr: "Ajouter, modifier et supprimer les projets du ministère" },
    tone: "bg-lime-100 text-lime-700",
    fields: [...titles, ...richDescs, link, { name: "images", label: { ar: "صور المشروع", fr: "Images du projet" }, type: "images", wide: true }],
    columns: [
      { name: "images", label: { ar: "الصورة", fr: "Image" }, type: "image" },
      ...titleColumns,
      { name: "images", label: { ar: "عدد الصور", fr: "Nombre d'images" }, type: "count" },
    ],
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "procedures-services",
    endpoint: "/procedures-services",
    icon: faFileSignature,
    label: { ar: "الإجراءات والخدمات", fr: "Procédures et services" },
    itemLabel: { ar: "إجراء", fr: "procédure" },
    description: { ar: "إدارة الإجراءات والخدمات المقدمة للمواطنين", fr: "Gérer les procédures et services aux citoyens" },
    tone: "bg-cyan-100 text-cyan-700",
    fields: [
      ...titles,
      ...richTexts,
      { name: "image", label: { ar: "الصورة", fr: "Image" }, type: "image" },
      { name: "fichier", label: { ar: "الملف (PDF)", fr: "Fichier (PDF)" }, type: "file", accept: "application/pdf" },
    ],
    columns: [{ name: "image", label: { ar: "الصورة", fr: "Image" }, type: "image" }, ...titleColumns],
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "videos",
    endpoint: "/videos",
    icon: faVideo,
    label: { ar: "الفيديوهات", fr: "Vidéos" },
    itemLabel: { ar: "فيديو", fr: "vidéo" },
    description: { ar: "إضافة الفيديوهات المعروضة في الصفحة الرئيسية", fr: "Ajouter les vidéos affichées sur la page d'accueil" },
    tone: "bg-rose-100 text-rose-700",
    fields: [
      ...titles,
      ...richDescs,
      {
        name: "fichier",
        label: { ar: "ملف الفيديو", fr: "Fichier vidéo" },
        type: "file",
        accept: "video/*",
        help: { ar: "أو أضف رابطاً (يوتيوب…) في الحقل أدناه", fr: "Ou indiquez un lien (YouTube…) ci-dessous" },
      },
      link,
    ],
    columns: [...titleColumns, { name: "lien", label: { ar: "الرابط", fr: "Lien" }, type: "link" }],
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "mot-ministre",
    endpoint: "/motministre",
    icon: faCommentDots,
    label: { ar: "كلمة الوزير", fr: "Mot du ministre" },
    itemLabel: { ar: "كلمة", fr: "mot" },
    description: { ar: "نص كلمة الوزير المعروض في صفحة الوزير", fr: "Texte du mot du ministre affiché sur sa page" },
    tone: "bg-amber-100 text-amber-700",
    fields: [...titles, ...richTexts],
    columns: titleColumns,
    searchFields: ["titrearabe", "titrefrancais"],
    singleRecord: true, // the minister page shows only the first record
  },
  {
    key: "taches",
    endpoint: "/tachesministere",
    icon: faListCheck,
    label: { ar: "مهام الوزارة", fr: "Missions du ministère" },
    itemLabel: { ar: "مهمة", fr: "mission" },
    description: { ar: "عناوين مجموعات مهام الوزارة", fr: "Intitulés des groupes de missions du ministère" },
    tone: "bg-green-100 text-green-700",
    fields: titles,
    columns: titleColumns,
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "liste-taches",
    endpoint: "/listetaches",
    icon: faListUl,
    label: { ar: "تفاصيل المهام", fr: "Détail des missions" },
    itemLabel: { ar: "عنصر", fr: "élément" },
    description: { ar: "عناصر كل مجموعة من مهام الوزارة", fr: "Éléments de chaque groupe de missions" },
    tone: "bg-teal-100 text-teal-700",
    fields: [
      {
        name: "tacheid",
        label: { ar: "المهمة الرئيسية", fr: "Mission parente" },
        type: "select",
        required: true,
        options: { endpoint: "/tachesministere", labelAr: "titrearabe", labelFr: "titrefrancais" },
        wide: true,
      },
      ...titles,
    ],
    columns: [{ name: "tacheid", label: { ar: "المهمة الرئيسية", fr: "Mission parente" }, type: "lookup", lookupField: "tacheid" }, ...titleColumns],
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "structure",
    endpoint: "/structureadministrative",
    icon: faSitemap,
    label: { ar: "الهيكلة الإدارية", fr: "Structure administrative" },
    itemLabel: { ar: "عنصر", fr: "élément" },
    description: { ar: "مديريات ومصالح الوزارة", fr: "Directions et services du ministère" },
    tone: "bg-sky-100 text-sky-700",
    fields: [
      ...titles,
      ...richTexts,
      { name: "fichierarabe", label: { ar: "ملف بالعربية (PDF)", fr: "Fichier en arabe (PDF)" }, type: "file", accept: "application/pdf" },
      { name: "fichierfrancais", label: { ar: "ملف بالفرنسية (PDF)", fr: "Fichier en français (PDF)" }, type: "file", accept: "application/pdf" },
    ],
    columns: titleColumns,
    searchFields: ["titrearabe", "titrefrancais"],
  },
  {
    key: "reseaux-sociaux",
    endpoint: "/comptessociaux",
    icon: faShareNodes,
    label: { ar: "حسابات التواصل الاجتماعي", fr: "Réseaux sociaux" },
    itemLabel: { ar: "حساب", fr: "compte" },
    description: { ar: "الروابط المعروضة في تذييل الموقع", fr: "Liens affichés dans le pied de page" },
    tone: "bg-blue-100 text-blue-700",
    fields: [
      { name: "nom", label: { ar: "الاسم (مثل Facebook)", fr: "Nom (ex. Facebook)" }, type: "text", required: true },
      { name: "lien", label: { ar: "الرابط", fr: "Lien" }, type: "url", required: true },
      {
        name: "icon",
        label: { ar: "الأيقونة (اختياري)", fr: "Icône (facultatif)" },
        type: "image",
        help: { ar: "بدون أيقونة تُستخدم أيقونة الشبكة تلقائياً", fr: "Sans icône, celle du réseau est utilisée automatiquement" },
      },
    ],
    columns: [
      { name: "icon", label: { ar: "الأيقونة", fr: "Icône" }, type: "image" },
      { name: "nom", label: { ar: "الاسم", fr: "Nom" } },
      { name: "lien", label: { ar: "الرابط", fr: "Lien" }, type: "link" },
    ],
    searchFields: ["nom", "lien"],
  },
];

export const findCrudSection = (key?: string) => CRUD_SECTIONS.find((s) => s.key === key);
