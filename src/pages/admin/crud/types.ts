import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type Bilingual = { ar: string; fr: string };

export type FieldType =
  | "text" // single line
  | "textarea" // multi-line plain text
  | "richtext" // Quill editor (HTML)
  | "url"
  | "number"
  | "checkbox"
  | "image" // single file, sent as base64
  | "file" // single file (PDF, video…), sent as base64
  | "images" // list of images, sent as [{ image: base64 }]
  | "select"; // value picked from another endpoint

export interface FieldDef {
  name: string; // backend property name
  label: Bilingual;
  type: FieldType;
  /** Content direction for text fields holding Arabic or French content. */
  dir?: "rtl" | "ltr";
  required?: boolean;
  /** For file fields: the accept attribute, e.g. "application/pdf". */
  accept?: string;
  /** For select fields: where to load options and how to label them. */
  options?: { endpoint: string; labelAr: string; labelFr: string; valueKey?: string };
  /** Occupies the full form width (rich text, images…). Text pairs sit side by side otherwise. */
  wide?: boolean;
  help?: Bilingual;
}

export type ColumnType = "text" | "image" | "link" | "boolean" | "count" | "lookup";

export interface ColumnDef {
  name: string;
  label: Bilingual;
  type?: ColumnType;
  dir?: "rtl" | "ltr";
  /** For "lookup": resolve an id through a select field's options. */
  lookupField?: string;
}

export interface CrudSection {
  /** URL segment: /admin/<key>, /admin/<key>/new, /admin/<key>/edit/:id */
  key: string;
  /** Backend endpoint, relative to the API base, e.g. "/sousetablissements". */
  endpoint: string;
  icon: IconDefinition;
  label: Bilingual; // plural, e.g. "Établissements sous tutelle"
  itemLabel: Bilingual; // singular, e.g. "établissement"
  description: Bilingual;
  tone: string; // dashboard badge colours
  fields: FieldDef[];
  columns: ColumnDef[];
  /** Fields searched by the list's search box. */
  searchFields: string[];
}
