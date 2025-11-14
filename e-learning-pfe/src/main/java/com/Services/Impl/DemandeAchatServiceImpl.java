package com.Services.Impl;

import com.Services.DemandeAchatService;
import com.dto.DemandeAchatFormationDto;
import com.entities.DemandeAchatFormation;
import com.entities.Module;
import com.exeptions.DemandeAchatNotFoundException;
import com.repositories.DemandeAchatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.dto.ModuleDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandeAchatServiceImpl implements DemandeAchatService {
    private final DemandeAchatRepository demandeAchatRepository;


    @Override
    public DemandeAchatFormationDto addDemandeAchat(DemandeAchatFormationDto demandeAchatFormationDto) {
        DemandeAchatFormation demandeachatformation = DemandeAchatFormationDto.toEntity(demandeAchatFormationDto);
        demandeachatformation = demandeAchatRepository.save(demandeachatformation);
        return DemandeAchatFormationDto.toDto(demandeachatformation);
    }

    @Override
    public DemandeAchatFormationDto getDemandeAchatById(Long id) throws DemandeAchatNotFoundException {
        return demandeAchatRepository.findById(id)
                .map(DemandeAchatFormationDto::toDto)
                .orElseThrow(() -> new DemandeAchatNotFoundException("DemandeAchatFormation avec id " + id + " introuvable"));
    }

    @Override
    public List<DemandeAchatFormationDto> getDemandeAchats() {
        return demandeAchatRepository.findAll()
                .stream()
                .map(DemandeAchatFormationDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public  void deleteDemandeAchatById(Long id)  throws DemandeAchatNotFoundException {
        if (!demandeAchatRepository.existsById(id)) {
            throw new DemandeAchatNotFoundException("DemandeAchatFormation avec id " + id + " introuvable");
        }
        demandeAchatRepository.deleteById(id);
    }


    @Override
    public DemandeAchatFormationDto updateStatut(Long id, String statut) {
        DemandeAchatFormation demande = demandeAchatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée avec id = " + id));

        try {
            // convertir le String en Enum
            DemandeAchatFormation.StatutDemande newStatut = DemandeAchatFormation.StatutDemande.valueOf(statut.toUpperCase());
            demande.setStatut(newStatut);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide : " + statut);
        }

        DemandeAchatFormation saved = demandeAchatRepository.save(demande);

        return DemandeAchatFormationDto.toDto(saved);
    }


    @Override
    public List<ModuleDto> getAcceptedModulesForApprenant(Long apprenantId) {
        List<Module> modules = demandeAchatRepository.findAcceptedModulesByApprenantId(apprenantId);
        return modules.stream()
                .map(ModuleDto::toDto) // prend un Module entity
                .toList();
    }
@Override
    public boolean hasAccess(Long apprenantId, Long moduleId) {
        return demandeAchatRepository.existsByApprenantIdAndModuleIdAndStatut(
                apprenantId, moduleId, DemandeAchatFormation.StatutDemande.ACCEPTEE
        );
    }

}
