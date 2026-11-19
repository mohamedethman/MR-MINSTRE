package win.Domaines.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path storageRoot;

    public MediaStorageService(@Value("${app.media.storage-path}") String storagePath) {
        this.storageRoot = Paths.get(storagePath);
    }

    public String saveIfBase64(String value, String prefix) {
        return saveIfBase64(value, prefix, null);
    }

    public String saveIfBase64(String value, String prefix, String mimeTypeHint) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmed = value.trim();
        if (looksLikeFileName(trimmed)) {
            return trimmed;
        }

        DecodedPayload payload = decodePayload(trimmed, mimeTypeHint);
        String extension = payload.extension().isBlank() ? "bin" : payload.extension();
        String safePrefix = (prefix == null || prefix.isBlank()) ? "file" : prefix;
        String fileName = safePrefix + "-" + UUID.randomUUID() + "." + extension;

        try {
            Files.createDirectories(storageRoot);
            Files.write(storageRoot.resolve(fileName), payload.content(),
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier: " + fileName, e);
        }

        return fileName;
    }

    private boolean looksLikeFileName(String value) {
        return value.matches("^[^\\\\/:*?\"<>|]+\\.[A-Za-z0-9]{2,8}$");
    }

    private DecodedPayload decodePayload(String raw, String mimeTypeHint) {
        if (raw.startsWith("data:")) {
            int commaIndex = raw.indexOf(',');
            if (commaIndex < 0) {
                throw new IllegalArgumentException("Format data URI invalide.");
            }
            String metadata = raw.substring(5, commaIndex).toLowerCase(Locale.ROOT);
            String base64Data = raw.substring(commaIndex + 1);
            byte[] content = Base64.getDecoder().decode(base64Data);
            return new DecodedPayload(content, extensionFromMime(metadata));
        }

        byte[] content = Base64.getDecoder().decode(raw);
        String extension = extensionFromMime(mimeTypeHint);
        if ("bin".equals(extension)) {
            extension = extensionFromContent(content);
        }
        return new DecodedPayload(content, extension);
    }

    private String extensionFromMime(String metadata) {
        if (metadata == null || metadata.isBlank()) return "bin";
        if (metadata.contains("image/jpeg") || metadata.contains("image/jpg")) return "jpg";
        if (metadata.contains("image/png")) return "png";
        if (metadata.contains("image/webp")) return "webp";
        if (metadata.contains("image/gif")) return "gif";
        if (metadata.contains("application/pdf")) return "pdf";
        if (metadata.contains("application/msword")) return "doc";
        if (metadata.contains("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) return "docx";
        if (metadata.contains("application/vnd.ms-excel")) return "xls";
        if (metadata.contains("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) return "xlsx";
        if (metadata.contains("application/vnd.openxmlformats-officedocument.presentationml.presentation")) return "pptx";
        if (metadata.contains("application/vnd.ms-powerpoint")) return "ppt";
        if (metadata.contains("video/mp4")) return "mp4";
        if (metadata.contains("video/webm")) return "webm";
        return "bin";
    }

    private String extensionFromContent(byte[] content) {
        if (content == null || content.length < 4) return "bin";

        if ((content[0] & 0xFF) == 0x89 && content[1] == 0x50 && content[2] == 0x4E && content[3] == 0x47) {
            return "png";
        }
        if ((content[0] & 0xFF) == 0xFF && (content[1] & 0xFF) == 0xD8) {
            return "jpg";
        }
        if (content[0] == 0x25 && content[1] == 0x50 && content[2] == 0x44 && content[3] == 0x46) {
            return "pdf";
        }
        if (content[0] == 0x47 && content[1] == 0x49 && content[2] == 0x46) {
            return "gif";
        }
        if (content.length >= 12 &&
                content[0] == 0x52 && content[1] == 0x49 && content[2] == 0x46 && content[3] == 0x46 &&
                content[8] == 0x57 && content[9] == 0x45 && content[10] == 0x42 && content[11] == 0x50) {
            return "webp";
        }

        return "bin";
    }

    private record DecodedPayload(byte[] content, String extension) {
    }
}
