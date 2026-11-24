import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit, faExternalLinkAlt, faPlus, faSearch, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../services/api";
import AdminLayout from "../AdminLayout";
import CellText from "../../../components/CellText";
import { useT } from "../../../i18n";
import { useConfirm } from "../../../components/ConfirmDialog";
import { mediaUrl, stripHtml } from "../../../utils/content";
import { findCrudSection } from "./sections";
import { ColumnDef } from "./types";

type Row = Record<string, any> & { id: number };

const firstImage = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : first?.image ?? null;
  }
  return typeof value === "string" ? value : null;
};

/** Generic admin list for any section defined in sections.ts. */
const CrudList: React.FC = () => {
  const { section: key } = useParams<{ section: string }>();
  const section = findCrudSection(key);
  const { t, isArabic } = useT();
  const confirm = useConfirm();
  const [rows, setRows] = useState<Row[]>([]);
  const [lookups, setLookups] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    try {
      const response = await api.get(section.endpoint);
      setRows(Array.isArray(response.data) ? response.data : []);
      // Resolve ids shown in "lookup" columns (e.g. parent mission names).
      const next: Record<string, Record<string, string>> = {};
      for (const column of section.columns.filter((c) => c.type === "lookup")) {
        const field = section.fields.find((f) => f.name === column.lookupField);
        if (!field?.options) continue;
        const res = await api.get(field.options.endpoint);
        const map: Record<string, string> = {};
        (Array.isArray(res.data) ? res.data : []).forEach((item: Row) => {
          const label = isArabic
            ? item[field.options!.labelAr] || item[field.options!.labelFr]
            : item[field.options!.labelFr] || item[field.options!.labelAr];
          map[String(item[field.options!.valueKey || "id"])] = label;
        });
        next[column.name] = map;
      }
      setLookups(next);
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء جلب البيانات", "Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  }, [section, isArabic, t]);

  useEffect(() => {
    setSearch("");
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!section || !search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((row) => section.searchFields.some((f) => stripHtml(String(row[f] ?? "")).toLowerCase().includes(q)));
  }, [rows, search, section]);

  // Columns in the active language's order: in French, an Arabic (rtl) column
  // immediately followed by its French (ltr) twin is swapped so French leads.
  const columns = useMemo(() => {
    const cols = [...(section?.columns ?? [])];
    if (isArabic) return cols;
    for (let i = 0; i < cols.length - 1; i++) {
      if (cols[i].dir === "rtl" && cols[i + 1].dir === "ltr") {
        [cols[i], cols[i + 1]] = [cols[i + 1], cols[i]];
        i++;
      }
    }
    return cols;
  }, [section, isArabic]);

  if (!section) return <Navigate to="/admin/dashboard" replace />;

  const label = (l: { ar: string; fr: string }) => (isArabic ? l.ar : l.fr);

  const handleDelete = async (row: Row) => {
    if (!await confirm(t("هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.", "Confirmer la suppression ? Cette action est irréversible."))) return;
    try {
      await api.delete(`${section.endpoint}/${row.id}`);
      toast.success(t("تم الحذف بنجاح", "Supprimé avec succès"));
      setRows((current) => current.filter((r) => r.id !== row.id));
    } catch (error) {
      console.error(error);
      toast.error(t("حدث خطأ أثناء الحذف", "Erreur lors de la suppression"));
    }
  };

  const renderCell = (row: Row, column: ColumnDef) => {
    const value = row[column.name];
    switch (column.type) {
      case "image": {
        const src = mediaUrl(firstImage(value));
        return src ? (
          <img src={src} alt="" className="h-12 w-16 rounded bg-gray-100 object-contain" />
        ) : (
          <span className="flex h-12 w-16 items-center justify-center rounded bg-gray-100 text-gray-300">—</span>
        );
      }
      case "link":
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[14rem] items-center gap-1 truncate text-mauritania-green hover:underline" title={value}>
            <FontAwesomeIcon icon={faExternalLinkAlt} className="shrink-0 text-xs" />
            <span className="truncate" dir="ltr">{value}</span>
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        );
      case "boolean":
        return <FontAwesomeIcon icon={value ? faCheck : faTimes} className={value ? "text-green-600" : "text-gray-400"} />;
      case "count":
        return <span>{Array.isArray(value) ? value.length : 0}</span>;
      case "lookup":
        return <CellText text={lookups[column.name]?.[String(value)] ?? (value != null ? `#${value}` : "")} />;
      default:
        return <CellText text={value} dir={column.dir} />;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">{label(section.label)}</h1>
        <Link
          to={`/admin/${section.key}/new`}
          className="inline-flex items-center gap-2 rounded bg-mauritania-green px-4 py-2 text-white transition hover:bg-mauritania-green-dark"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t("إضافة", "Ajouter")}
        </Link>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("بحث...", "Rechercher…")}
            className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-10 focus:outline-none focus:ring-2 focus:ring-mauritania-green"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-600">{t("جاري التحميل...", "Chargement…")}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white py-12 text-center shadow-md">
          <p className="text-gray-600">{t("لا توجد عناصر", "Aucun élément")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, i) => (
                    <th key={`${column.name}-${i}`} className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                      {label(column.label)}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">{t("الإجراءات", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column, i) => (
                      <td key={`${column.name}-${i}`} className="px-6 py-4 text-sm text-gray-900">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/admin/${section.key}/edit/${row.id}`}
                          className="text-mauritania-green hover:text-mauritania-green-dark"
                          title={t("تعديل", "Modifier")}
                          aria-label={t("تعديل", "Modifier")}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-red-600 hover:text-red-800"
                          title={t("حذف", "Supprimer")}
                          aria-label={t("حذف", "Supprimer")}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CrudList;
