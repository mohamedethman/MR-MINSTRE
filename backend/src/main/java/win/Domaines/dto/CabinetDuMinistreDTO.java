package win.Domaines.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import win.Domaines.entity.CabinetDuMinistre;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CabinetDuMinistreDTO {

    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private String descarabe;
    private String descfrancais;
    private String fichier;
    @JsonProperty("fichier_type")
    private String fichierType;

    public static CabinetDuMinistreDTO fromEntity(CabinetDuMinistre c) {
        return CabinetDuMinistreDTO.builder()
                .id(c.getId())
                .titrearabe(c.getTitrearabe())
                .titrefrancais(c.getTitrefrancais())
                .descarabe(c.getDescarabe())
                .descfrancais(c.getDescfrancais())
                .fichier(c.getFichier())
                .build();
    }
}
