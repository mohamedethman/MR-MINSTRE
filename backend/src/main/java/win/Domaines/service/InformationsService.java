package win.Domaines.service;

import org.springframework.stereotype.Service;
import win.Domaines.dto.InformationsDTO;
import win.Domaines.entity.Informations;
import win.Domaines.exception.ResourceNotFoundException;
import win.Domaines.repository.InformationsRepository;

import java.util.List;

@Service
public class InformationsService {

    private final InformationsRepository informationsRepository;
    private final MediaStorageService mediaStorageService;

    public InformationsService(InformationsRepository informationsRepository, MediaStorageService mediaStorageService) {
        this.informationsRepository = informationsRepository;
        this.mediaStorageService = mediaStorageService;
    }

    public Informations create(InformationsDTO dto) {
        Informations i = new Informations();
        i.setNomsite(dto.getNomsite());
        i.setNomsitear(dto.getNomsitear());
        i.setAdresse(dto.getAdresse());
        i.setAdressear(dto.getAdressear());
        i.setTelephone(dto.getTelephone());
        i.setEmail(dto.getEmail());
        i.setHoraires(dto.getHoraires());
        i.setHorairesar(dto.getHorairesar());

        if (dto.getLogo() != null && !dto.getLogo().isEmpty()) {
            i.setLogo(mediaStorageService.saveIfBase64(dto.getLogo(), "logo"));
        }

        return informationsRepository.save(i);
    }

    public Informations update(Long id, InformationsDTO dto) {
        Informations i = informationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Informations not found with id " + id));

        i.setNomsite(dto.getNomsite());
        i.setNomsitear(dto.getNomsitear());
        i.setAdresse(dto.getAdresse());
        i.setAdressear(dto.getAdressear());
        i.setTelephone(dto.getTelephone());
        i.setEmail(dto.getEmail());
        i.setHoraires(dto.getHoraires());
        i.setHorairesar(dto.getHorairesar());

        if (dto.getLogo() != null && !dto.getLogo().isEmpty()) {
            i.setLogo(mediaStorageService.saveIfBase64(dto.getLogo(), "logo"));
        }

        return informationsRepository.save(i);
    }

    public void deleteById(Long id) {
        informationsRepository.deleteById(id);
    }

    public Informations getById(Long id) {
        return informationsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Informations not found with id " + id));
    }

    public List<Informations> getAll() {
        return informationsRepository.findAll();
    }
}
