package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.LeMinistre;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeMinistreDTO {
    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String textarabe;
    private String textfrancais;
    private String image;
    private String cvarabe;
    private String cvfrancais;

    public static LeMinistreDTO fromEntity(LeMinistre m) {
        return LeMinistreDTO.builder()
                .id(m.getId())
                .titrearabe(m.getTitrearabe())
                .titrefrancais(m.getTitrefrancais())
                .textarabe(m.getTextarabe())
                .textfrancais(m.getTextfrancais())
                .image(m.getImage())
                .cvarabe(m.getCvarabe())
                .cvfrancais(m.getCvfrancais())
                .build();
    }
}
