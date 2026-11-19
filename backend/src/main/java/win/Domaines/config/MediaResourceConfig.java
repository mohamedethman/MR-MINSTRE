package win.Domaines.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class MediaResourceConfig implements WebMvcConfigurer {

    private final String storagePath;

    public MediaResourceConfig(@Value("${app.media.storage-path}") String storagePath) {
        this.storagePath = storagePath;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path mediaPath = Paths.get(storagePath).toAbsolutePath().normalize();
        String mediaLocation = mediaPath.toUri().toString();

        registry.addResourceHandler("/assets/**")
                .addResourceLocations(mediaLocation);
    }
}
