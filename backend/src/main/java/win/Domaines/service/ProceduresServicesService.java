package win.Domaines.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import win.Domaines.dto.ProceduresServicesDTO;
import win.Domaines.entity.ProceduresServices;
import win.Domaines.repository.ProceduresServicesRepository;

import java.util.List;

@Service
public class ProceduresServicesService {

    private final ProceduresServicesRepository repository;
    private final MediaStorageService mediaStorageService;

    public ProceduresServicesService(ProceduresServicesRepository repository, MediaStorageService mediaStorageService) {
        this.repository = repository;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional
    public ProceduresServices create(ProceduresServicesDTO dto) {
        ProceduresServices p = new ProceduresServices();
        p.setTitrearabe(dto.getTitrearabe());
        p.setTitrefrancais(dto.getTitrefrancais());
        p.setTextarabe(dto.getTextarabe());
        p.setTextfrancais(dto.getTextfrancais());

        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            p.setImage(mediaStorageService.saveIfBase64(dto.getImage(), "procedure-image"));
        }

        if (dto.getFichier() != null && !dto.getFichier().isEmpty()) {
            p.setFichier(mediaStorageService.saveIfBase64(dto.getFichier(), "procedure-file"));
        }

        return repository.save(p);
    }

    @Transactional
    public ProceduresServices update(Long id, ProceduresServicesDTO dto) {
        ProceduresServices p = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procédure/Service non trouvé"));

        p.setTitrearabe(dto.getTitrearabe());
        p.setTitrefrancais(dto.getTitrefrancais());
        p.setTextarabe(dto.getTextarabe());
        p.setTextfrancais(dto.getTextfrancais());

        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            p.setImage(mediaStorageService.saveIfBase64(dto.getImage(), "procedure-image"));
        }

        if (dto.getFichier() != null && !dto.getFichier().isEmpty()) {
            p.setFichier(mediaStorageService.saveIfBase64(dto.getFichier(), "procedure-file"));
        }

        return repository.save(p);
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ProceduresServices getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procédure/Service non trouvé"));
    }

    @Transactional(readOnly = true)
    public List<ProceduresServices> getAll() {
        return repository.findAll();
    }

 
    @Transactional(readOnly = true)
public String getImageBase64(Long id) {
    ProceduresServices p = getById(id);
    return p.getImage();
}

@Transactional(readOnly = true)
public String getFichierBase64(Long id) {
    ProceduresServices p = getById(id);
    return p.getFichier();
}

}
