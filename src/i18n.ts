import { useCallback } from "react";
import { useLanguage } from "./context/LanguageContext";

/**
 * Bilingual UI text helper. Every user-facing string in the app is written
 * as `t("نص عربي", "Texte français")`, so no screen can show Arabic-only
 * text in the French version (or the reverse).
 *
 *   const { t, isArabic, dir, locale, formatDate } = useT();
 *   <h1>{t("إدارة الأخبار", "Gestion des actualités")}</h1>
 */
export const useT = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const t = useCallback((ar: string, fr: string) => (isArabic ? ar : fr), [isArabic]);

  const locale = isArabic ? "ar-MR" : "fr-FR";

  const formatDate = useCallback(
    (value?: string | number | Date | null, options?: Intl.DateTimeFormatOptions) => {
      if (value === null || value === undefined || value === "") return "";
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleDateString(locale, options ?? { year: "numeric", month: "long", day: "numeric" });
    },
    [locale]
  );

  /**
   * Orders a bilingual pair so the current language comes first — e.g. the
   * "Titre (français)" column leads in the French UI, "العنوان (عربي)" in Arabic.
   * Give each element a `key` when passing JSX.
   */
  const pair = useCallback(<T,>(ar: T, fr: T): [T, T] => (isArabic ? [ar, fr] : [fr, ar]), [isArabic]);

  return {
    t,
    pair,
    language,
    isArabic,
    dir: (isArabic ? "rtl" : "ltr") as "rtl" | "ltr",
    locale,
    formatDate,
  };
};

export type TFunction = ReturnType<typeof useT>["t"];
