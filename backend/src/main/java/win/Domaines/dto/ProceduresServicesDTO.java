package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.ProceduresServices;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProceduresServicesDTO {

    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String textarabe;
    private String textfrancais;
    private String image;   // Nom de fichier image
    private String fichier; // Nom de fichier document

    public static ProceduresServicesDTO fromEntity(ProceduresServices p) {
        return ProceduresServicesDTO.builder()
                .id(p.getId())
                .titrearabe(p.getTitrearabe())
                .titrefrancais(p.getTitrefrancais())
                .textarabe(p.getTextarabe())
                .textfrancais(p.getTextfrancais())
                .image(p.getImage())
                .fichier(p.getFichier())
                .build();
    }
}
