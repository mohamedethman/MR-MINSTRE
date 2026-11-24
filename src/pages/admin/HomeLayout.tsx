import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faSave,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { HOME_SECTIONS, HOME_SECTION_LABELS, HomeSectionConfig } from "../../config/homeSections";
import { fetchMenuRows, MenuRow, resolveHomeLayout, saveHomeLayout } from "../../services/homeLayout";

const sameLayout = (a: HomeSectionConfig[], b: HomeSectionConfig[]) =>
  a.length === b.length && a.every((s, i) => s.id === b[i].id && s.visible === b[i].visible);

/** Admin page: order and show/hide the Home page sections (stored via /api/menu). */
const HomeLayoutAdmin: React.FC = () => {
  const { t, isArabic } = useT();
  const [rows, setRows] = useState<MenuRow[]>([]);
  const [saved, setSaved] = useState<HomeSectionConfig[]>(HOME_SECTIONS);
  const [layout, setLayout] = useState<HomeSectionConfig[]>(HOME_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMenuRows();
      const current = resolveHomeLayout(data);
      setRows(data);
      setSaved(current);
      setLayout(current);
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء جلب البيانات", "Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= layout.length) return;
    const next = [...layout];
    [next[index], next[target]] = [next[target], next[index]];
    setLayout(next);
  };

  const toggle = (index: number) =>
    setLayout((current) => current.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s)));

  const dirty = !sameLayout(layout, saved);
  const visibleCount = layout.filter((s) => s.visible).length;

  const handleSave = async () => {
    if (visibleCount === 0) {
      toast.error(t("يجب إظهار قسم واحد على الأقل", "Au moins une section doit rester affichée"));
      return;
    }
    setSaving(true);
    try {
      await saveHomeLayout(layout, rows);
      toast.success(t("تم حفظ تنظيم الصفحة الرئيسية", "Organisation de l'accueil enregistrée"));
      await load();
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء الحفظ", "Erreur lors de l'enregistrement"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mauritania-green-dark">
            {t("تنظيم الصفحة الرئيسية", "Organisation de l'accueil")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              "رتّب أقسام الصفحة الرئيسية من الأعلى إلى الأسفل وحدد الأقسام الظاهرة. تُطبَّق التغييرات على جميع الزوار بعد الحفظ.",
              "Ordonnez les sections de l'accueil de haut en bas et choisissez celles qui sont affichées. Les changements s'appliquent à tous les visiteurs après l'enregistrement."
            )}
          </p>
        </div>
        <Link
          to="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded border border-mauritania-green px-4 py-2 text-mauritania-green transition hover:bg-mauritania-green/10"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
          {t("عرض الصفحة الرئيسية", "Voir l'accueil")}
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">{t("جاري التحميل...", "Chargement…")}</p>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <ol className="space-y-3">
            {layout.map((section, index) => {
              const label = HOME_SECTION_LABELS[section.id];
              return (
                <li
                  key={section.id}
                  className={`flex flex-wrap items-center gap-4 rounded-lg border p-4 transition ${
                    section.visible ? "border-gray-200 bg-white" : "border-dashed border-gray-300 bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      section.visible ? "bg-mauritania-green text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${section.visible ? "text-gray-900" : "text-gray-500 line-through"}`}>
                      {isArabic ? label.ar : label.fr}
                    </p>
                    <p className="text-xs text-gray-500">
                      {section.visible ? t("ظاهر", "Affichée") : t("مخفي", "Masquée")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title={t("نقل إلى الأعلى", "Monter")}
                      aria-label={t("نقل إلى الأعلى", "Monter")}
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === layout.length - 1}
                      className="rounded border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title={t("نقل إلى الأسفل", "Descendre")}
                      aria-label={t("نقل إلى الأسفل", "Descendre")}
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={section.visible}
                      onClick={() => toggle(index)}
                      className={`inline-flex w-28 items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium transition ${
                        section.visible
                          ? "bg-mauritania-green/10 text-mauritania-green-dark hover:bg-mauritania-green/20"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      <FontAwesomeIcon icon={section.visible ? faEye : faEyeSlash} />
                      {section.visible ? t("ظاهر", "Affichée") : t("مخفي", "Masquée")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <button
              type="button"
              onClick={() => setLayout(HOME_SECTIONS.map((s) => ({ ...s })))}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faUndo} />
              {t("استعادة الترتيب الافتراضي", "Rétablir l'ordre par défaut")}
            </button>
            <div className="flex items-center gap-3">
              {dirty && (
                <span className="text-sm text-amber-600">{t("تغييرات غير محفوظة", "Modifications non enregistrées")}</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-2 rounded-md bg-mauritania-green px-6 py-2 text-white transition hover:bg-mauritania-green-dark disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} />
                {saving ? t("جاري الحفظ...", "Enregistrement…") : t("حفظ", "Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HomeLayoutAdmin;
