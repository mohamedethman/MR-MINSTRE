import { API_BASE_URL, isEmptyHtml, mediaKind, mediaUrl, sanitizeHtml, stripHtml } from "./content";

describe("sanitizeHtml", () => {
  it("keeps Quill formatting", () => {
    const html =
      '<p class="ql-align-justify ql-direction-rtl"><strong>الاسم</strong> و<em>اللقب</em></p><ol><li>أول</li></ol><p style="text-align: center; color: rgb(0, 0, 0)">x</p>';
    const out = sanitizeHtml(html);
    expect(out).toContain('class="ql-align-justify ql-direction-rtl"');
    expect(out).toContain("<strong>الاسم</strong>");
    expect(out).toContain("<em>اللقب</em>");
    expect(out).toContain("<ol><li>أول</li></ol>");
    expect(out).toContain("text-align: center");
  });

  it("removes executable content", () => {
    const out = sanitizeHtml('<p onclick="x()">a<script>alert(1)</script><a href="javascript:alert(1)">l</a><img src=x onerror="y()"></p>');
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
  });

  it("turns plain text line breaks into paragraphs", () => {
    expect(sanitizeHtml("a\nb\n\nc")).toBe("<p>a<br>b</p><p>c</p>");
  });
});

describe("helpers", () => {
  it("detects empty editor output", () => {
    expect(isEmptyHtml("<p><br></p>")).toBe(true);
    expect(isEmptyHtml(null)).toBe(true);
    expect(isEmptyHtml("<p>x</p>")).toBe(false);
  });

  it("strips html for excerpts", () => {
    expect(stripHtml("<p>a&nbsp;b</p><p>c</p>")).toBe("a b c");
  });

  it("resolves media values", () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl("data:image/png;base64,AA")).toBe("data:image/png;base64,AA");
    expect(mediaUrl("https://x.mr/a.jpg")).toBe("https://x.mr/a.jpg");
  });

  it("detects the real type of raw base64 (JPEG base64 starts with '/')", () => {
    expect(mediaUrl("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD")).toBe("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD");
    expect(mediaUrl("iVBORw0KGgoAAAANSUhEUg")).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg");
    expect(mediaUrl("JVBERi0xLjQK")).toBe("data:application/pdf;base64,JVBERi0xLjQK");
    expect(mediaUrl("/9j/AAAA", "image/png")).toBe("data:image/png;base64,/9j/AAAA");
  });

  it("serves stored files through the API base, so the /api proxy covers them", () => {
    expect(mediaUrl("actualites-1b2c.jpg")).toBe(`${API_BASE_URL}/assets/actualites-1b2c.jpg`);
    expect(mediaUrl("profiles/photo 1.png")).toBe(`${API_BASE_URL}/assets/profiles/photo%201.png`);
    expect(mediaUrl("/assets/logo.png")).toBe(`${API_BASE_URL}/assets/logo.png`);
    expect(mediaUrl("/api/assets/logo.png")).toBe(`${API_BASE_URL}/assets/logo.png`);
  });

  it("classifies media", () => {
    expect(mediaKind("/9j/AAAA")).toBe("image");
    expect(mediaKind("JVBERi0xLjQK")).toBe("pdf");
    expect(mediaKind("clip.mp4")).toBe("video");
    expect(mediaKind(null)).toBeNull();
  });
});
