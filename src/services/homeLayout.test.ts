import { HOME_SECTIONS } from "../config/homeSections";
import { resolveHomeLayout } from "./homeLayout";

jest.mock("./api", () => ({ __esModule: true, default: {} }));

const parent = { id: 10, lien: "home:sections", etat: false, parentId: null };

describe("resolveHomeLayout", () => {
  it("falls back to the default layout when nothing is saved or the data is invalid", () => {
    expect(resolveHomeLayout([])).toEqual(HOME_SECTIONS);
    expect(resolveHomeLayout(undefined)).toEqual(HOME_SECTIONS);
    expect(resolveHomeLayout("oops")).toEqual(HOME_SECTIONS);
  });

  it("orders sections by `ordre` and maps `etat` to visibility", () => {
    const rows = [
      parent,
      { id: 1, lien: "home:news", ordre: 3, etat: false, parentId: 10 },
      { id: 2, lien: "home:announcements", ordre: 1, etat: true, parentId: 10 },
      { id: 3, lien: "home:ministerAndLatest", ordre: 2, etat: true, parentId: 10 },
    ];
    const layout = resolveHomeLayout(rows);
    expect(layout.slice(0, 3)).toEqual([
      { id: "announcements", visible: true },
      { id: "ministerAndLatest", visible: true },
      { id: "news", visible: false },
    ]);
    // Sections never saved are appended with their default visibility.
    expect(layout.map((s) => s.id).sort()).toEqual(HOME_SECTIONS.map((s) => s.id).sort());
  });

  it("ignores real menu rows, unknown ids and rows outside the layout group", () => {
    const rows = [
      parent,
      { id: 4, lien: "/contact", ordre: 1, etat: true, parentId: null },
      { id: 5, lien: "home:unknown", ordre: 1, etat: true, parentId: 10 },
      { id: 6, lien: "home:media", ordre: 1, etat: false, parentId: 99 },
    ];
    expect(resolveHomeLayout(rows)).toEqual(HOME_SECTIONS);
  });
});
