/**
 * Official name of the ministry. It is fixed (not editable in the admin) and
 * shown everywhere: public header and footer, admin header, login page and
 * the browser tab title.
 */
export const MINISTRY_NAME = {
  ar: "وزارة العقارات وأملاك الدولة والإصلاح العقاري",
  fr: "Ministère des Domaines du Patrimoine de l’État de la Réforme Foncière",
} as const;

/** Platform version, shown in the public footer and on the admin login page. */
export const APP_VERSION = "v1.2";

export const ministryName =(isArabic: boolean): string => (isArabic ? MINISTRY_NAME.ar : MINISTRY_NAME.fr);

/**
 * Location of the ministry building, shown on the Contact page map. Fixed like
 * the name: the backend has no coordinates field. Plus code 32QG+VQR, Rue Omar,
 * Nouakchott (resolved by Google Maps to the coordinates below).
 */
export const MINISTRY_LOCATION = {
  lat: 18.0897375,
  lng: -15.9731094,
  plusCode: "32QG+VQR, Rue Omar, Nouakchott, Mauritanie",
} as const;
