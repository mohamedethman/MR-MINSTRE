/**
 * Home page layout stored through the existing /api/menu resource.
 *
 * The backend has no dedicated endpoint, so the layout is kept as menu rows:
 *   - one parent row   { lien: "home:sections", etat: false }  (tags the group, never active)
 *   - one child row per section { lien: "home:<sectionId>", ordre: position, etat: visible }
 * Rows whose `lien` does not start with "home:" are ignored, so real menus are untouched.
 */
import api from "./api";
import { HOME_SECTIONS, HOME_SECTION_LABELS, HomeSectionConfig, HomeSectionId } from "../config/homeSections";

export interface MenuRow {
  id?: number;
  nomarabe?: string;
  nomfrancais?: string;
  lien?: string;
  ordre?: number;
  etat?: boolean;
  parentId?: number | null;
}

export const HOME_LAYOUT_PARENT_LINK = "home:sections";
const sectionLink = (id: HomeSectionId) => `home:${id}`;
const KNOWN_IDS = new Set<string>(HOME_SECTIONS.map((s) => s.id));

const asRows = (value: unknown): MenuRow[] => (Array.isArray(value) ? (value as MenuRow[]) : []);

const findParent = (rows: MenuRow[]) => rows.find((r) => r.lien === HOME_LAYOUT_PARENT_LINK && r.id != null);

/** Section rows, preferring those attached to the layout parent. */
const sectionRows = (rows: MenuRow[]) => {
  const parent = findParent(rows);
  return rows.filter(
    (r) =>
      typeof r.lien === "string" &&
      r.lien.startsWith("home:") &&
      r.lien !== HOME_LAYOUT_PARENT_LINK &&
      KNOWN_IDS.has(r.lien.slice(5)) &&
      (!parent || r.parentId === parent.id)
  );
};

/**
 * Turns /api/menu rows into the ordered layout. Sections never saved (e.g. a
 * section added to the code later) are appended with their default visibility.
 */
export const resolveHomeLayout = (value: unknown): HomeSectionConfig[] => {
  const saved = sectionRows(asRows(value))
    .slice()
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

  const layout: HomeSectionConfig[] = [];
  for (const row of saved) {
    const id = row.lien!.slice(5) as HomeSectionId;
    if (!layout.some((s) => s.id === id)) layout.push({ id, visible: row.etat !== false });
  }
  for (const def of HOME_SECTIONS) {
    if (!layout.some((s) => s.id === def.id)) layout.push({ ...def });
  }
  return layout;
};

/** Fresh read for the admin page (bypasses the public cache). */
export const fetchMenuRows = async (): Promise<MenuRow[]> => asRows((await api.get("/menu")).data);

/**
 * Saves the layout: creates the parent row on first save, then updates or
 * creates one row per section. Runs sequentially so rows are never duplicated.
 */
export const saveHomeLayout = async (layout: HomeSectionConfig[], rows: MenuRow[]): Promise<void> => {
  let parent = findParent(rows);
  if (!parent) {
    const created = await api.post("/menu", {
      nomarabe: "أقسام الصفحة الرئيسية",
      nomfrancais: "Sections de l'accueil",
      lien: HOME_LAYOUT_PARENT_LINK,
      ordre: 0,
      etat: false,
      parentId: null,
    });
    parent = created.data as MenuRow;
  }

  const existing = sectionRows(rows);
  for (let index = 0; index < layout.length; index++) {
    const section = layout[index];
    const link = sectionLink(section.id);
    const row = existing.find((r) => r.lien === link);
    const payload = {
      nomarabe: HOME_SECTION_LABELS[section.id].ar,
      nomfrancais: HOME_SECTION_LABELS[section.id].fr,
      lien: link,
      ordre: index + 1,
      etat: section.visible,
      parentId: parent.id,
    };
    if (row?.id != null) await api.put(`/menu/${row.id}`, payload);
    else await api.post("/menu", payload);
  }
};
