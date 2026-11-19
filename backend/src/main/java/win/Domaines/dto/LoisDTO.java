package win.Domaines.dto;

import lombok.*;
import win.Domaines.entity.Lois;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoisDTO {
    private Long id;
    private String titrearabe;
    private String titrefrancais;
    private LocalDate datesortie;
    private String fichierarabe;
    private String fichierfrancais;
    

    public static LoisDTO fromEntity(Lois l) {
        return LoisDTO.builder()
                .id(l.getId())
                .titrearabe(l.getTitrearabe())
                .titrefrancais(l.getTitrefrancais())
                .datesortie(l.getDatesortie())
                .fichierarabe(l.getFichierarabe())
                .fichierfrancais(l.getFichierfrancais())
                .build();
    }
}
