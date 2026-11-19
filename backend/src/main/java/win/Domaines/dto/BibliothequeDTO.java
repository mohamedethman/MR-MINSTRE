package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.Bibliotheque;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BibliothequeDTO {

    private Long id;
    private String descriptionarabe;
    private String descriptionfrancais;
    private List<String> fichiers; // Noms de fichiers
     private List<String> liens;    // URLs
    private Long categorieId;
    private Integer ordre;
    private Boolean etat;

    public static BibliothequeDTO fromEntity(Bibliotheque b) {
        List<String> fichiersNoms = null;
        if (b.getFichiers() != null) {
            fichiersNoms = b.getFichiers().stream()
                    .map(BibliothequeFichier -> BibliothequeFichier.getFichier())
                    .collect(Collectors.toList());
        }

        
        List<String> liensList = null;
        if (b.getLiens() != null) {
            liensList = b.getLiens().stream()
                    .map(l -> l.getUrl())
                    .collect(Collectors.toList());
        }

        return BibliothequeDTO.builder()
                .id(b.getId())
                .descriptionarabe(b.getDescriptionarabe())
                .descriptionfrancais(b.getDescriptionfrancais())
                .fichiers(fichiersNoms)
                .liens(liensList)
                .categorieId(b.getCategorie() != null ? b.getCategorie().getId() : null)
                .ordre(b.getOrdre())
                .etat(b.getEtat())
                .build();
    }
}
