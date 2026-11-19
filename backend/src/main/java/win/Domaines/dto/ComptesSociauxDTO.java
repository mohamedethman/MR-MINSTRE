package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.ComptesSociaux;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComptesSociauxDTO {
    private Long id;
    private String nom;
    private String lien;
    private String icon; // Nom de fichier

    public static ComptesSociauxDTO fromEntity(ComptesSociaux c) {
        return ComptesSociauxDTO.builder()
                .id(c.getId())
                .nom(c.getNom())
                .lien(c.getLien())
                .icon(c.getIcon())
                .build();
    }
}
