package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.Actualites;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualitesDTO {
    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String textarabe;
    private String textfrancais;
    private String image; // Nom de fichier
    private LocalDateTime datepublication;
    private Long categorieid;
     private String lienar;
    private String lienfr;

    public static ActualitesDTO fromEntity(Actualites a) {
        return ActualitesDTO.builder()
                .id(a.getId())
                .titrearabe(a.getTitrearabe())
                .titrefrancais(a.getTitrefrancais())
                .textarabe(a.getTextarabe())
                .lienar(a.getLienar())
                .lienfr(a.getLienfr())
                .textfrancais(a.getTextfrancais())
                .image(a.getImage())
                .datepublication(a.getDatepublication())
                .categorieid(a.getCategorie() != null ? a.getCategorie().getId() : null)
                .build();
    }
}
