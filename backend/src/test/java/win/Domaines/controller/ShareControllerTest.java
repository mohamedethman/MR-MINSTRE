package win.Domaines.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import win.Domaines.entity.Actualites;
import win.Domaines.repository.ActualitesRepository;

import java.util.Base64;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ShareControllerTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};

    private ShareController controllerWith(Actualites news) {
        ActualitesRepository repo = mock(ActualitesRepository.class);
        when(repo.findById(7L)).thenReturn(Optional.ofNullable(news));
        return new ShareController(repo, "./target/test-assets", "https://domaines.gov.mr/");
    }

    private Actualites sample() {
        Actualites a = new Actualites();
        a.setId(7L);
        a.setTitrearabe("خبر");
        a.setTitrefrancais("Le ministre reçoit \"la délégation\"");
        a.setTextarabe("<p>نص</p>");
        a.setTextfrancais("<p><strong>Nouakchott</strong> &amp; partenaires : " + "texte ".repeat(60) + "</p>");
        a.setImage(Base64.getEncoder().encodeToString(PNG));
        return a;
    }

    @Test
    void sharePageHasOpenGraphTagsAndRedirect() {
        String html = controllerWith(sample()).sharePage(7L, "fr").getBody();
        assertNotNull(html);
        assertTrue(html.contains("<meta property=\"og:title\" content=\"Le ministre reçoit &quot;la délégation&quot;\">"));
        assertTrue(html.contains("<meta property=\"og:url\" content=\"https://domaines.gov.mr/api/share/actualites/7?lang=fr\">"));
        assertTrue(html.contains("<meta property=\"og:image\" content=\"https://domaines.gov.mr/api/share/actualites/7/image\">"));
        assertTrue(html.contains("summary_large_image"));
        assertTrue(html.contains("content=\"Nouakchott &amp; partenaires : texte"), "description is plain text");
        assertFalse(html.contains("<strong>"));
        assertTrue(html.contains("…\">"), "long description is shortened");
        assertTrue(html.contains("url=https://domaines.gov.mr/#/news/7"), "visitors are redirected to the article");
    }

    @Test
    void arabicIsTheDefaultLanguage() {
        String html = controllerWith(sample()).sharePage(7L, "ar").getBody();
        assertTrue(html.contains("<meta property=\"og:title\" content=\"خبر\">"));
        assertTrue(html.contains("lang=\"ar\" dir=\"rtl\""));
    }

    @Test
    void imageEndpointDecodesBase64WithTheRightType() {
        ResponseEntity<byte[]> response = controllerWith(sample()).shareImage(7L);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("image/png", String.valueOf(response.getHeaders().getContentType()));
        assertArrayEquals(PNG, response.getBody());
    }

    @Test
    void unknownNewsIs404() {
        assertEquals(404, controllerWith(null).sharePage(7L, "fr").getStatusCode().value());
        assertEquals(404, controllerWith(null).shareImage(7L).getStatusCode().value());
    }
}
