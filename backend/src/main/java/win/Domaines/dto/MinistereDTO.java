package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.Ministere;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinistereDTO {
    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String textarabe;
    private String textfrancais;
    private String image; // Nom de fichier

    // Conversion depuis l'entité
    public static MinistereDTO fromEntity(Ministere m) {
        return MinistereDTO.builder()
                .id(m.getId())
                .titrearabe(m.getTitrearabe())
                .titrefrancais(m.getTitrefrancais())
                .textarabe(m.getTextarabe())
                .textfrancais(m.getTextfrancais())
                .image(m.getImage())
                .build();
    }
}
