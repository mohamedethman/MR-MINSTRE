package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.StructureAdministrative;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StructureAdministrativeDTO {
    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String fichierarabe;    // Nom de fichier
    private String fichierfrancais; // Nom de fichier
    private String textarabe;
    private String textfrancais;

    public static StructureAdministrativeDTO fromEntity(StructureAdministrative s) {
        return StructureAdministrativeDTO.builder()
                .id(s.getId())
                .titrearabe(s.getTitrearabe())
                .titrefrancais(s.getTitrefrancais())
                .fichierarabe(s.getFichierarabe())
                .fichierfrancais(s.getFichierfrancais())
                .textarabe(s.getTextArabe())
                .textfrancais(s.getTextFrancais())
                .build();
    }
}
