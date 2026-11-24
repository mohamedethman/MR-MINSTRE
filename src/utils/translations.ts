// src/utils/translations.ts
export const translations = {
  ar: {
    heroTitle: "نحو إصلاح عقاري متكامل",
    heroDescription:
      "وزارة العقارات وأملاك الدولة والإصلاح العقاري تقدم لكم أحدث الخدمات الإلكترونية لتسهيل المعاملات العقارية",
    learnMoreButton: "تعرف على مهام الوزارة",
    servicesButton: "الخدمات الإلكترونية",
    aboutMinistry: "عن الوزارة",
    loadingMinister: "جاري تحميل بيانات الوزير...",
    minister: "وزير العقارات",
    ministerWord: "كلمة الوزير",
    ministerCV: "السيرة الذاتية للوزير",
    readMore: "قراءة المزيد",
    noMinisterData: "لا توجد بيانات للوزير",
    vision: "الرؤية",
    backToMinistry: "العودة إلى صفحة الوزارة",
    backToAnnouncements: "العودة إلى صفحة الإعلانات",
    announcementNotFound: "الإعلان غير موجود",
    recentNews: "آخر الأخبار",
    recentAnnouncements: "الإعلانات الحديثة",
    recentLegislation: "التشريعات الحديثة",
    quickLinks: "روابط سريعة",
    viewAll: "عرض الكل",
    new: "جديد",
    noAnnouncements: "لا توجد إعلانات متاحة",
    noLegislation: "لا توجد تشريعات متاحة",
    visionText:
      "أن نكون الوزارة الرائدة في إدارة وتنظيم القطاع العقاري، وأن نحقق نظاماً عقارياً متكاملاً يسهم في التنمية الاقتصادية والاجتماعية المستدامة.",
    mission: "الرسالة",
    missionText:
      "تنظيم وإدارة الأملاك العقارية الوطنية بكفاءة وشفافية، وتقديم خدمات عقارية متميزة للمواطنين والمستثمرين، ووضع السياسات والتشريعات التي تضمن حقوق الملكية وتشجع الاستثمار العقاري.",
    officialAnnouncements: "الإعلانات الرسمية",
    loadingAnnouncements: "جاري تحميل الإعلانات...",
    fullDetails: "التفاصيل الكاملة",

    moreAnnouncements: "المزيد من الإعلانات",
    ministryNews: "أخبار الوزارة",
    loadingNews: "جاري تحميل الأخبار...",
    noNews: "لا توجد أخبار حالياً",
    moreNews: "المزيد من الأخبار",
    news: "الأخبار",
  },
  fr: {
    heroTitle: "Vers une réforme foncière intégrée",
    heroDescription:
      "Le Ministère des Domaines et de la Réforme Foncière vous propose les derniers services électroniques pour faciliter les transactions immobilières",
    learnMoreButton: "Découvrez les missions du ministère",
    servicesButton: "Services électroniques",
    aboutMinistry: "À propos du ministère",
    loadingMinister: "Chargement des données du ministre...",
    minister: "Ministre des Domaines",
    ministerWord: "Mot du ministre",
    readMore: "Lire la suite",
    noMinisterData: "Aucune donnée disponible pour le ministre",
    ministerCV: "CV du ministre",
    vision: "Vision",
    visionText:
      "Être le ministère leader dans la gestion et la régulation du secteur foncier, et réaliser un système foncier intégré qui contribue au développement économique et social durable.",
    mission: "Mission",
    missionText:
      "Organiser et gérer efficacement et transparentement les propriétés foncières nationales, offrir des services immobiliers exceptionnels aux citoyens et aux investisseurs, et établir des politiques et législations qui garantissent les droits de propriété et encouragent l'investissement immobilier.",
    officialAnnouncements: "Annonces officielles",
    loadingAnnouncements: "Chargement des annonces...",
    fullDetails: "Détails complets",
    noAnnouncements: "Aucune annonce pour le moment",
    moreAnnouncements: "Plus d'annonces",
    ministryNews: "Actualités du ministère",
    loadingNews: "Chargement des actualités...",
    noNews: "Aucune actualité pour le moment",
    moreNews: "Plus d'actualités",
    recentNews: "Actualités Récentes",
    recentAnnouncements: "Annonces Récentes",
    recentLegislation: "Législation Récente",
    quickLinks: "Liens Rapides",
    viewAll: "Voir Tout",
    new: "Nouveau",

    noLegislation: "Aucune législation disponible",
  },
};

export const getTranslation = (key: string, language: "ar" | "fr"): string => {
  return (
    translations[language][
      key as keyof (typeof translations)[typeof language]
    ] || key
  );
};
