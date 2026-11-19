package win.Domaines.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leministre")
public class LeMinistre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titrearabe", length = 255)
    private String titrearabe;

    @Column(name = "titrefrancais", length = 255)
    private String titrefrancais;

    @Lob
    @Column(name = "textarabe", columnDefinition = "TEXT")
    private String textarabe;

    @Lob
    @Column(name = "textfrancais", columnDefinition = "TEXT")
    private String textfrancais;

    @Column(name = "image")
    private String image;

    @Column(name = "cvarabe")
    private String cvarabe; // Nom de fichier CV arabe

    @Column(name = "cvfrancais")
    private String cvfrancais; // Nom de fichier CV francais

    public LeMinistre() {}

    public LeMinistre(String titrearabe, String titrefrancais, String textarabe, String textfrancais, String image, String cvarabe, String cvfrancais) {
        this.titrearabe = titrearabe;
        this.titrefrancais = titrefrancais;
        this.textarabe = textarabe;
        this.textfrancais = textfrancais;
        this.image = image;
        this.cvarabe = cvarabe;
        this.cvfrancais = cvfrancais;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitrearabe() { return titrearabe; }
    public void setTitrearabe(String titrearabe) { this.titrearabe = titrearabe; }

    public String getTitrefrancais() { return titrefrancais; }
    public void setTitrefrancais(String titrefrancais) { this.titrefrancais = titrefrancais; }

    public String getTextarabe() { return textarabe; }
    public void setTextarabe(String textarabe) { this.textarabe = textarabe; }

    public String getTextfrancais() { return textfrancais; }
    public void setTextfrancais(String textfrancais) { this.textfrancais = textfrancais; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCvarabe() { return cvarabe; }
    public void setCvarabe(String cvarabe) { this.cvarabe = cvarabe; }

    public String getCvfrancais() { return cvfrancais; }
    public void setCvfrancais(String cvfrancais) { this.cvfrancais = cvfrancais; }
}
