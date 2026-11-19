package win.Domaines.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import win.Domaines.dto.LoisDTO;
import win.Domaines.dto.LoisProjection;
import win.Domaines.entity.Lois;
import win.Domaines.repository.LoisRepository;

import java.util.List;

@Service
public class LoisService {

    private final LoisRepository repository;
    private final MediaStorageService mediaStorageService;

    public LoisService(LoisRepository repository, MediaStorageService mediaStorageService) {
        this.repository = repository;
        this.mediaStorageService = mediaStorageService;
    }

    @Transactional
    public Lois create(LoisDTO dto) {
        Lois l = new Lois();
        l.setTitrearabe(dto.getTitrearabe());
        l.setTitrefrancais(dto.getTitrefrancais());
        l.setDatesortie(dto.getDatesortie());
        l.setFichierarabe(mediaStorageService.saveIfBase64(dto.getFichierarabe(), "loi-ar"));
        l.setFichierfrancais(mediaStorageService.saveIfBase64(dto.getFichierfrancais(), "loi-fr"));

        return repository.save(l);
    }

    @Transactional
    public Lois update(Long id, LoisDTO dto) {
        Lois l = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lois non trouvée"));

        l.setTitrearabe(dto.getTitrearabe());
        l.setTitrefrancais(dto.getTitrefrancais());
        l.setDatesortie(dto.getDatesortie());

        l.setFichierarabe(mediaStorageService.saveIfBase64(dto.getFichierarabe(), "loi-ar"));
        l.setFichierfrancais(mediaStorageService.saveIfBase64(dto.getFichierfrancais(), "loi-fr"));

        return repository.save(l);
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Lois getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lois non trouvée"));
    }

    // 🔹 Version rapide pour getAll
    @Transactional(readOnly = true)
    public List<LoisProjection> getAllLight() {
        return repository.findAllLight();
    }

    @Transactional(readOnly = true)
    public List<Lois> getAll() {
        return repository.findAll();
    }
    

    @Transactional(readOnly = true)
    public String getFichierArabeBase64(Long id) {
        Lois l = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lois non trouvée"));
        return l.getFichierarabe();
    }

    @Transactional(readOnly = true)
    public String getFichierFrancaisBase64(Long id) {
        Lois l = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lois non trouvée"));
        return l.getFichierfrancais();
    }

}
