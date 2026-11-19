package win.Domaines.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import win.Domaines.dto.ProjetsDTO;
import win.Domaines.dto.ProjetImageDTO;
import win.Domaines.entity.Projets;
import win.Domaines.entity.ProjetImage;
import win.Domaines.repository.ProjetsRepository;

import java.util.List;

@Service
public class ProjetsService {

    private final ProjetsRepository repository;
    private final MediaStorageService mediaStorageService;

    public ProjetsService(ProjetsRepository repository, MediaStorageService mediaStorageService) {
        this.repository = repository;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional
    public Projets create(ProjetsDTO dto) {
        Projets p = new Projets();
        p.setTitrearabe(dto.getTitrearabe());
        p.setTitrefrancais(dto.getTitrefrancais());
        p.setDescarabe(dto.getDescarabe());
        p.setDescfrancais(dto.getDescfrancais());
        p.setLien(dto.getLien());

        if (dto.getImages() != null) {
            for (ProjetImageDTO imgDto : dto.getImages()) {
                ProjetImage img = new ProjetImage();
                img.setImage(mediaStorageService.saveIfBase64(imgDto.getImage(), "projet"));
                p.addImage(img);
            }
        }

        return repository.save(p);
    }

    @Transactional
    public Projets update(Long id, ProjetsDTO dto) {
        Projets p = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        p.setTitrearabe(dto.getTitrearabe());
        p.setTitrefrancais(dto.getTitrefrancais());
        p.setDescarabe(dto.getDescarabe());
        p.setDescfrancais(dto.getDescfrancais());
        p.setLien(dto.getLien());

        // gérer les images si nécessaire (ici on remplace toutes)
        p.getImages().clear();
        if (dto.getImages() != null) {
            for (ProjetImageDTO imgDto : dto.getImages()) {
                ProjetImage img = new ProjetImage();
                img.setImage(mediaStorageService.saveIfBase64(imgDto.getImage(), "projet"));
                p.addImage(img);
            }
        }

        return repository.save(p);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

   

    @Transactional(readOnly = true)
public Projets getById(Long id) {
    Projets p = repository.findByIdWithImages(id);
    if (p == null) {
        throw new RuntimeException("Projet non trouvé");
    }
    return p;
}


   @Transactional(readOnly = true)
public List<Projets> getAll() {
    return repository.findAllWithImages();
}

}
