package win.Domaines.service;

import org.springframework.stereotype.Service;
import win.Domaines.dto.ComptesSociauxDTO;
import win.Domaines.entity.ComptesSociaux;
import win.Domaines.exception.ResourceNotFoundException;
import win.Domaines.repository.ComptesSociauxRepository;

import java.util.List;

@Service
public class ComptesSociauxService {

    private final ComptesSociauxRepository comptesSociauxRepository;
    private final MediaStorageService mediaStorageService;

    public ComptesSociauxService(ComptesSociauxRepository comptesSociauxRepository, MediaStorageService mediaStorageService) {
        this.comptesSociauxRepository = comptesSociauxRepository;
        this.mediaStorageService = mediaStorageService;
    }

    public ComptesSociaux create(ComptesSociauxDTO dto) {
        ComptesSociaux c = new ComptesSociaux();
        c.setNom(dto.getNom());
        c.setLien(dto.getLien());

        if (dto.getIcon() != null && !dto.getIcon().isEmpty()) {
            c.setIcon(mediaStorageService.saveIfBase64(dto.getIcon(), "icon"));
        }

        return comptesSociauxRepository.save(c);
    }

    public ComptesSociaux update(Long id, ComptesSociauxDTO dto) {
        ComptesSociaux c = comptesSociauxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte social not found with id " + id));

        c.setNom(dto.getNom());
        c.setLien(dto.getLien());

        if (dto.getIcon() != null && !dto.getIcon().isEmpty()) {
            c.setIcon(mediaStorageService.saveIfBase64(dto.getIcon(), "icon"));
        }

        return comptesSociauxRepository.save(c);
    }

    public void deleteById(Long id) {
        comptesSociauxRepository.deleteById(id);
    }

    public ComptesSociaux getById(Long id) {
        return comptesSociauxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte social not found with id " + id));
    }

    public List<ComptesSociaux> getAll() {
        return comptesSociauxRepository.findAll();
    }
}
