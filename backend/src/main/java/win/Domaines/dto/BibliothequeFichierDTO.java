package win.Domaines.dto;

import lombok.*;

import win.Domaines.entity.BibliothequeFichier;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BibliothequeFichierDTO {

    private Long id;
    private String fichier; // Nom de fichier

    public static BibliothequeFichierDTO fromEntity(BibliothequeFichier f) {
        return BibliothequeFichierDTO.builder()
                .id(f.getId())
                .fichier(f.getFichier())
                .build();
    }
}
