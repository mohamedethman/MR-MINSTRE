/** API base URL, same as services/api.ts (relative "/api" in production builds). */
export const API_BASE_URL = (process.env.REACT_APP_API_URL || "/api").replace(/\/+$/, "");

/*
 * Media values coming from the backend can be:
 *   - raw base64 (older records / the currently deployed API), e.g. "/9j/4AAQ…" (JPEG), "iVBORw0…" (PNG)
 *   - a data:, http(s): or blob: URL
 *   - a stored file name, e.g. "actualites-1b2c.jpg" or "profiles/x.png" (current backend: saved
 *     under app.media.storage-path and served at /assets/** and /api/assets/**)
 *   - a server path, e.g. "/assets/x.jpg"
 * Files are always requested through the API base ("/api/assets/…"), so they work wherever the
 * API works — locally, and behind the /api proxy on https://domaines.gov.mr.
 */
const FILE_NAME = /^[\w\-. %()]+(\/[\w\-. %()]+)*\.[A-Za-z0-9]{2,8}$/;
const SERVER_PATH = /^\/[\w\-./ %()]+\.[A-Za-z0-9]{2,8}$/;

const BASE64_SIGNATURES: [string, string][] = [
  ["/9j/", "image/jpeg"],
  ["iVBORw0KGgo", "image/png"],
  ["R0lGOD", "image/gif"],
  ["UklGR", "image/webp"],
  ["PHN2Zy", "image/svg+xml"],
  ["PD94bWwg", "image/svg+xml"],
  ["Qk", "image/bmp"],
  ["JVBERi0", "application/pdf"],
  ["AAAAGGZ0eXA", "video/mp4"],
  ["AAAAHGZ0eXA", "video/mp4"],
  ["AAAAIGZ0eXA", "video/mp4"],
  ["GkXf", "video/webm"],
];

/** Guesses the MIME type of raw base64 data from its first bytes. */
export const detectBase64Mime = (base64: string, fallback = "image/jpeg"): string =>
  BASE64_SIGNATURES.find(([prefix]) => base64.startsWith(prefix))?.[1] ?? fallback;

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

/**
 * Turns any media value from the backend into a URL usable in src/href.
 * Returns null when there is nothing to show.
 */
export const mediaUrl = (value?: string | null, mimeHint?: string): string | null => {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  if (/^(data:|https?:\/\/|blob:)/i.test(v)) return v;
  if (v.length < 300 && SERVER_PATH.test(v)) {
    const path = v.replace(/^\/api(?=\/)/, "");
    return `${API_BASE_URL}${encodePath(path)}`;
  }
  if (v.length < 300 && FILE_NAME.test(v)) return `${API_BASE_URL}/assets/${encodePath(v)}`;
  const base64 = v.replace(/\s+/g, "");
  return `data:${mimeHint || detectBase64Mime(base64)};base64,${base64}`;
};

/** Rough type of a media value, to choose between <img>, <video> or a file link. */
export const mediaKind = (value?: string | null): "image" | "video" | "pdf" | "other" | null => {
  const url = mediaUrl(value);
  if (!url) return null;
  const mime = url.startsWith("data:") ? url.slice(5).split(/[;,]/)[0] : "";
  const ext = url.startsWith("data:") ? "" : (url.split(/[?#]/)[0].split(".").pop() || "").toLowerCase();
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext)) return "image";
  if (mime.startsWith("video/") || ["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  return "other";
};

/** Converts a data: URL to an object URL (browsers block opening data: URLs in a new tab). */
const toObjectUrl = (url: string): string => {
  if (!url.startsWith("data:")) return url;
  const [meta, data] = url.split(",", 2);
  const mime = meta.slice(5).split(";")[0] || "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
};

/** Opens a media file (image, PDF…) in a new tab, whatever form the backend sent it in. */
export const openMedia = (value?: string | null, mimeHint?: string): boolean => {
  const url = mediaUrl(value, mimeHint);
  if (!url) return false;
  window.open(toObjectUrl(url), "_blank", "noopener");
  return true;
};

/** Downloads a media file, whatever form the backend sent it in. */
export const downloadMedia = (value: string | null | undefined, fileName: string, mimeHint?: string): boolean => {
  const url = mediaUrl(value, mimeHint);
  if (!url) return false;
  const link = document.createElement("a");
  link.href = toObjectUrl(url);
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
};

/** Picks the Arabic or French variant of a bilingual backend field. */
export const pickLang = (isArabic: boolean, ar?: string | null, fr?: string | null): string =>
  ((isArabic ? ar || fr : fr || ar) || "").trim();

/** Plain-text version of editor HTML, for excerpts and card previews. */
export const stripHtml = (value?: string | null): string => {
  if (!value) return "";
  const withBreaks = value.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, " ");
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = withBreaks;
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  return withBreaks.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
};

export const truncate = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;

const ALLOWED_TAGS = new Set([
  "P", "BR", "STRONG", "B", "EM", "I", "U", "S", "STRIKE", "SUB", "SUP", "SPAN", "DIV",
  "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE",
  "A", "IMG", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "HR", "FIGURE", "FIGCAPTION",
]);
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT", "BUTTON", "TEXTAREA", "SELECT", "LINK", "META"]);
const ALLOWED_ATTRS = new Set(["class", "style", "href", "src", "alt", "title", "dir", "target", "rel", "colspan", "rowspan", "data-list"]);
const SAFE_STYLE_PROPS = new Set([
  "text-align", "direction", "color", "background-color", "font-weight", "font-style",
  "text-decoration", "font-size", "padding-left", "padding-right", "margin-left", "margin-right",
]);

const cleanStyle = (style: string): string =>
  style
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => {
      const [prop, ...rest] = rule.split(":");
      const val = rest.join(":").toLowerCase();
      return prop && SAFE_STYLE_PROPS.has(prop.trim().toLowerCase()) && !/url\(|expression|javascript:/.test(val);
    })
    .join("; ");

const sanitizeNode = (node: Element) => {
  Array.from(node.children).forEach((child) => {
    if (DROP_WITH_CONTENT.has(child.tagName)) {
      child.remove();
      return;
    }
    sanitizeNode(child);
    if (!ALLOWED_TAGS.has(child.tagName)) {
      child.replaceWith(...Array.from(child.childNodes));
      return;
    }
    Array.from(child.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (!ALLOWED_ATTRS.has(name)) {
        child.removeAttribute(attr.name);
      } else if ((name === "href" || name === "src") && /^\s*(javascript|vbscript):/i.test(attr.value)) {
        child.removeAttribute(attr.name);
      } else if (name === "style") {
        const cleaned = cleanStyle(attr.value);
        if (cleaned) child.setAttribute("style", cleaned);
        else child.removeAttribute("style");
      }
    });
    if (child.tagName === "A") {
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noopener noreferrer");
    }
  });
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Prepares editor HTML (Quill output) for display: keeps the formatting
 * (paragraphs, bold, lists, alignment, indentation, colours, links) and
 * removes anything executable. Plain-text values keep their line breaks.
 */
export const sanitizeHtml = (value?: string | null): string => {
  if (!value || !value.trim()) return "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  const html = looksLikeHtml
    ? value
    : value
        .split(/\n{2,}/)
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
        .join("");
  if (typeof document === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = document.createElement("div");
  root.appendChild(template.content.cloneNode(true));
  sanitizeNode(root);
  return root.innerHTML;
};

/** True when editor HTML has no visible text (e.g. Quill's empty `<p><br></p>`). */
export const isEmptyHtml = (value?: string | null): boolean =>
  !stripHtml(value) && !/<img\b/i.test(value || "");
