import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileAlt, faPlus, faSave, faTimes, faUpload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../services/api";
import AdminLayout from "../AdminLayout";
import { useT } from "../../../i18n";
import { mediaKind, mediaUrl, openMedia } from "../../../utils/content";
import { findCrudSection } from "./sections";
import { useSingleRecordGuard } from "../../../hooks/useSingleRecordGuard";
import { FieldDef } from "./types";

type Values = Record<string, any>;
type Option = { value: string; label: string };

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { direction: "rtl" }],
    ["link"],
    ["clean"],
  ],
};

const MAX_FILE_MB = 20; // backend limit (spring.servlet.multipart / request size)

/** Reads a file as raw base64 (without the "data:…;base64," prefix), like the other admin forms. */
const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mauritania-green";

/** Generic admin create/edit form for any section defined in sections.ts. */
const CrudForm: React.FC = () => {
  const { section: key, id } = useParams<{ section: string; id?: string }>();
  const section = findCrudSection(key);
  const navigate = useNavigate();
  const { t, isArabic } = useT();
  const isEdit = Boolean(id);
  const [values, setValues] = useState<Values>({});
  const [original, setOriginal] = useState<Values>({});
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  // Single-record sections: "new" redirects to the existing record's edit form.
  const checkingSingle = useSingleRecordGuard(
    Boolean(section?.singleRecord) && !isEdit,
    section?.endpoint ?? "",
    (existingId) => `/admin/${section?.key}/edit/${existingId}`
  );

  const label = (l: { ar: string; fr: string }) => (isArabic ? l.ar : l.fr);

  // Load the record (edit) and the options of select fields.
  useEffect(() => {
    if (!section) return;
    let cancelled = false;
    (async () => {
      try {
        const selects = section.fields.filter((f) => f.type === "select" && f.options);
        const loaded: Record<string, Option[]> = {};
        for (const field of selects) {
          const res = await api.get(field.options!.endpoint);
          loaded[field.name] = (Array.isArray(res.data) ? res.data : []).map((item: Values) => ({
            value: String(item[field.options!.valueKey || "id"]),
            label: (isArabic ? item[field.options!.labelAr] || item[field.options!.labelFr] : item[field.options!.labelFr] || item[field.options!.labelAr]) || `#${item.id}`,
          }));
        }
        if (!cancelled) setOptions(loaded);

        if (id) {
          const res = await api.get(`${section.endpoint}/${id}`);
          if (!cancelled) {
            setOriginal(res.data || {});
            setValues(res.data || {});
          }
        } else if (!cancelled) {
          const empty: Values = {};
          section.fields.forEach((f) => {
            empty[f.name] = f.type === "images" ? [] : f.type === "checkbox" ? true : "";
          });
          setValues(empty);
        }
      } catch (error) {
        console.error(error);
        toast.error(t("حدث خطأ أثناء جلب البيانات", "Erreur lors du chargement des données"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [section, id, isArabic, t]);

  if (!section) return <Navigate to="/admin/dashboard" replace />;

  const set = (name: string, value: unknown) => setValues((current) => ({ ...current, [name]: value }));

  const tooBig = (file: File) => {
    if (file.size <= MAX_FILE_MB * 1024 * 1024) return false;
    toast.error(t(`حجم الملف يتجاوز ${MAX_FILE_MB} ميغابايت`, `Le fichier dépasse ${MAX_FILE_MB} Mo`));
    return true;
  };

  const pickFile = async (field: FieldDef, file?: File) => {
    if (!file || tooBig(file)) return;
    set(field.name, await readBase64(file));
  };

  const addImages = async (field: FieldDef, files: FileList | null) => {
    if (!files) return;
    const added: { image: string }[] = [];
    for (const file of Array.from(files)) {
      if (!tooBig(file)) added.push({ image: await readBase64(file) });
    }
    set(field.name, [...(values[field.name] || []), ...added]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of section.fields) {
      const v = values[field.name];
      if (field.required && (v === undefined || v === null || String(v).trim() === "")) {
        toast.error(t(`الحقل "${field.label.ar}" مطلوب`, `Le champ « ${field.label.fr} » est obligatoire`));
        return;
      }
    }
    const payload: Values = { ...original, ...values };
    section.fields.forEach((f) => {
      if ((f.type === "number" || f.type === "select") && payload[f.name] !== "" && payload[f.name] != null) {
        payload[f.name] = Number(payload[f.name]);
      }
      if (f.type === "images") payload[f.name] = (payload[f.name] || []).map((img: Values) => ({ image: img.image }));
      if ((f.type === "image" || f.type === "file") && !payload[f.name]) payload[f.name] = null;
    });

    setSaving(true);
    try {
      if (isEdit) await api.put(`${section.endpoint}/${id}`, payload);
      else await api.post(section.endpoint, payload);
      toast.success(t("تم الحفظ بنجاح", "Enregistré avec succès"));
      navigate(`/admin/${section.key}`);
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء الحفظ", "Erreur lors de l'enregistrement"));
    } finally {
      setSaving(false);
    }
  };

  const renderFileField = (field: FieldDef) => {
    const value: string | null = values[field.name] || null;
    const kind = mediaKind(value);
    const inputId = `file-${field.name}`;
    return (
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <div className="relative">
            {kind === "image" ? (
              <img src={mediaUrl(value) || undefined} alt="" className="h-24 w-24 rounded border bg-gray-50 object-contain" />
            ) : kind === "video" ? (
              <video src={mediaUrl(value) || undefined} className="h-24 w-40 rounded border bg-black" controls preload="metadata" />
            ) : (
              <button
                type="button"
                onClick={() => openMedia(value, field.accept?.includes("pdf") ? "application/pdf" : undefined)}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded border bg-gray-50 text-sm text-mauritania-green hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
                {t("عرض", "Ouvrir")}
              </button>
            )}
            <button
              type="button"
              onClick={() => set(field.name, null)}
              title={t("إزالة", "Retirer")}
              aria-label={t("إزالة", "Retirer")}
              className="absolute -end-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400">
            <FontAwesomeIcon icon={faUpload} />
          </div>
        )}
        <div>
          <input
            id={inputId}
            type="file"
            accept={field.type === "image" ? "image/*" : field.accept}
            className="hidden"
            onChange={(e) => {
              pickFile(field, e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <label htmlFor={inputId} className="inline-block cursor-pointer rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            {value ? t("تغيير الملف", "Changer le fichier") : t("اختر ملفاً", "Choisir un fichier")}
          </label>
          <p className="mt-1 text-xs text-gray-500">{t(`الحجم الأقصى ${MAX_FILE_MB} ميغابايت`, `Taille maximale ${MAX_FILE_MB} Mo`)}</p>
        </div>
      </div>
    );
  };

  const renderField = (field: FieldDef) => {
    const value = values[field.name];
    switch (field.type) {
      case "richtext":
        return (
          <div dir={field.dir} className={field.dir === "rtl" ? "quill-rtl" : ""}>
            <ReactQuill theme="snow" value={value || ""} onChange={(html) => set(field.name, html)} modules={quillModules} className="mb-12 h-56" />
          </div>
        );
      case "textarea":
        return <textarea dir={field.dir} rows={4} value={value || ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass} />;
      case "checkbox":
        return (
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(field.name, e.target.checked)} className="h-4 w-4" />
            {label(field.label)}
          </label>
        );
      case "select":
        return (
          <select value={value ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass}>
            <option value="">{t("اختر...", "Choisir…")}</option>
            {(options[field.name] || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "image":
      case "file":
        return renderFileField(field);
      case "images": {
        const images: { image: string }[] = value || [];
        const inputId = `images-${field.name}`;
        return (
          <div className="flex flex-wrap gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <img src={mediaUrl(img.image) || undefined} alt="" className="h-24 w-24 rounded border bg-gray-50 object-cover" />
                <button
                  type="button"
                  onClick={() => set(field.name, images.filter((_, i) => i !== index))}
                  title={t("إزالة", "Retirer")}
                  aria-label={t("إزالة", "Retirer")}
                  className="absolute -end-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            ))}
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addImages(field, e.target.files);
                e.target.value = "";
              }}
            />
            <label
              htmlFor={inputId}
              className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-mauritania-green hover:text-mauritania-green"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t("إضافة", "Ajouter")}
            </label>
          </div>
        );
      }
      default:
        return (
          <input
            type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
            dir={field.type === "url" ? "ltr" : field.dir}
            value={value ?? ""}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.type === "url" ? "https://" : undefined}
            className={inputClass}
          />
        );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {label(section.label)} — {isEdit ? t("تعديل", "Modifier") : t("إضافة", "Ajouter")}
        </h1>
        <Link to={`/admin/${section.key}`} className="inline-flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
          <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
          {t("رجوع إلى القائمة", "Retour à la liste")}
        </Link>
      </div>

      {loading || checkingSingle ? (
        <p className="py-12 text-center text-gray-600">{t("جاري التحميل...", "Chargement…")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className={field.wide || field.type === "richtext" ? "md:col-span-2" : ""}>
                {field.type !== "checkbox" && (
                  <label className="mb-2 block font-medium text-gray-700">
                    {label(field.label)}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                )}
                {renderField(field)}
                {field.help && <p className="mt-1 text-xs text-gray-500">{label(field.help)}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Link to={`/admin/${section.key}`} className="rounded bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300">
              {t("إلغاء", "Annuler")}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded bg-mauritania-green px-6 py-2 font-semibold text-white hover:bg-mauritania-green-dark disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? t("جاري الحفظ...", "Enregistrement…") : t("حفظ", "Enregistrer")}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};

export default CrudForm;
