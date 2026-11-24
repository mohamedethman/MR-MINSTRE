package win.Domaines.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import win.Domaines.entity.Actualites;
import win.Domaines.repository.ActualitesRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Link previews for social networks (Facebook, X, WhatsApp…).
 *
 * The site uses hash URLs (https://domaines.gov.mr/#/news/12). Crawlers ignore everything after
 * "#" and do not run JavaScript, so they would only ever see the generic home page. Shared links
 * therefore point here: this returns a tiny HTML page with the news' Open Graph tags (title,
 * short description, image) and immediately forwards visitors to the article itself.
 *
 *   GET /api/share/actualites/{id}?lang=fr   -> HTML with og:/twitter: tags, then redirect
 *   GET /api/share/actualites/{id}/image     -> the news image as a real image file
 */
@RestController
@RequestMapping("/api/share")
public class ShareController {

    private static final int DESCRIPTION_LENGTH = 200;

    private final ActualitesRepository actualitesRepository;
    private final Path storageRoot;
    private final String publicUrl;

    public ShareController(ActualitesRepository actualitesRepository,
                           @Value("${app.media.storage-path}") String storagePath,
                           @Value("${app.public-url:https://domaines.gov.mr}") String publicUrl) {
        this.actualitesRepository = actualitesRepository;
        this.storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
        this.publicUrl = publicUrl.replaceAll("/+$", "");
    }

    @GetMapping(value = "/actualites/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> sharePage(@PathVariable Long id, @RequestParam(defaultValue = "ar") String lang) {
        boolean french = "fr".equalsIgnoreCase(lang);
        String articleUrl = publicUrl + "/#/news/" + id;

        Optional<Actualites> found = actualitesRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.TEXT_HTML)
                    .body(redirectOnly(publicUrl + "/#/news"));
        }
        Actualites news = found.get();

        String title = pick(french, news.getTitrearabe(), news.getTitrefrancais());
        String description = shorten(plainText(pick(french, news.getTextarabe(), news.getTextfrancais())));
        String siteName = french
                ? "Ministère des Domaines du Patrimoine de l’État de la Réforme Foncière"
                : "وزارة العقارات وأملاك الدولة والإصلاح العقاري";
        String shareUrl = publicUrl + "/api/share/actualites/" + id + "?lang=" + (french ? "fr" : "ar");
        boolean hasImage = news.getImage() != null && !news.getImage().isBlank();
        String imageUrl = publicUrl + "/api/share/actualites/" + id + "/image";

        StringBuilder html = new StringBuilder(2048)
                .append("<!doctype html><html lang=\"").append(french ? "fr" : "ar").append("\" dir=\"").append(french ? "ltr" : "rtl").append("\"><head>")
                .append("<meta charset=\"utf-8\">")
                .append("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">")
                .append("<title>").append(esc(title)).append("</title>")
                .append(meta("name", "description", description))
                .append("<link rel=\"canonical\" href=\"").append(esc(articleUrl)).append("\">")
                .append(meta("property", "og:type", "article"))
                .append(meta("property", "og:site_name", siteName))
                .append(meta("property", "og:locale", french ? "fr_FR" : "ar_AR"))
                .append(meta("property", "og:title", title))
                .append(meta("property", "og:description", description))
                // og:url must be this page: if it pointed to the hash URL, Facebook would re-scrape the home page.
                .append(meta("property", "og:url", shareUrl));
        if (news.getDatepublication() != null) {
            html.append(meta("property", "article:published_time", news.getDatepublication().toString()));
        }
        if (hasImage) {
            html.append(meta("property", "og:image", imageUrl))
                .append(meta("property", "og:image:secure_url", imageUrl))
                .append(meta("property", "og:image:alt", title))
                .append(meta("name", "twitter:card", "summary_large_image"))
                .append(meta("name", "twitter:image", imageUrl));
        } else {
            html.append(meta("name", "twitter:card", "summary"));
        }
        html.append(meta("name", "twitter:title", title))
            .append(meta("name", "twitter:description", description))
            // People who open the link are sent straight to the article.
            .append("<meta http-equiv=\"refresh\" content=\"0;url=").append(esc(articleUrl)).append("\">")
            .append("<script>location.replace(").append(jsString(articleUrl)).append(");</script>")
            .append("</head><body><p><a href=\"").append(esc(articleUrl)).append("\">").append(esc(title)).append("</a></p></body></html>");

        return ResponseEntity.ok()
                .contentType(new MediaType("text", "html", java.nio.charset.StandardCharsets.UTF_8))
                .cacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES).cachePublic())
                .body(html.toString());
    }

    @GetMapping("/actualites/{id}/image")
    public ResponseEntity<byte[]> shareImage(@PathVariable Long id) {
        Optional<Actualites> found = actualitesRepository.findById(id);
        if (found.isEmpty() || found.get().getImage() == null || found.get().getImage().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        byte[] bytes = loadMedia(found.get().getImage().trim());
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(detectMime(bytes)))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .body(bytes);
    }

    /* ---------------- helpers ---------------- */

    /** Stored value is either a file name in the media folder or (older records) raw base64 / a data URI. */
    private byte[] loadMedia(String value) {
        if (value.matches("^[\\w\\-. ()%/]+\\.[A-Za-z0-9]{2,8}$") && value.length() < 300) {
            Path file = storageRoot.resolve(value.replaceFirst("^/?(api/)?assets/", "")).normalize();
            if (!file.startsWith(storageRoot) || !Files.isRegularFile(file)) return null;
            try {
                return Files.readAllBytes(file);
            } catch (IOException e) {
                return null;
            }
        }
        String base64 = value.startsWith("data:") ? value.substring(value.indexOf(',') + 1) : value;
        try {
            return Base64.getMimeDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static String detectMime(byte[] b) {
        if (b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8) return "image/jpeg";
        if (b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "image/png";
        if (b.length > 6 && b[0] == 'G' && b[1] == 'I' && b[2] == 'F') return "image/gif";
        if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "image/webp";
        return "image/jpeg";
    }

    private static String pick(boolean french, String ar, String fr) {
        String first = french ? fr : ar;
        String second = french ? ar : fr;
        if (first != null && !first.isBlank()) return first.trim();
        return second == null ? "" : second.trim();
    }

    private static String plainText(String html) {
        if (html == null) return "";
        return html.replaceAll("(?i)<br\\s*/?>|</(p|div|li|h[1-6])>", " ")
                .replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ").replace("&amp;", "&").replace("&quot;", "\"")
                .replace("&#39;", "'").replace("&lt;", "<").replace("&gt;", ">")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String shorten(String text) {
        if (text.length() <= DESCRIPTION_LENGTH) return text;
        String cut = text.substring(0, DESCRIPTION_LENGTH);
        int space = cut.lastIndexOf(' ');
        return (space > DESCRIPTION_LENGTH / 2 ? cut.substring(0, space) : cut) + "…";
    }

    private static String meta(String attr, String key, String content) {
        return "<meta " + attr + "=\"" + key + "\" content=\"" + esc(content) + "\">";
    }

    private static String esc(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private static String jsString(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("<", "\\u003c") + "\"";
    }

    private static String redirectOnly(String url) {
        return "<!doctype html><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=" + esc(url)
                + "\"><a href=\"" + esc(url) + "\">" + esc(url) + "</a>";
    }
}
