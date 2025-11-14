package com.Services;

import com.dto.DemandeAchatFormationDto;

import com.dto.ModuleDto;
import com.exeptions.DemandeAchatNotFoundException;
import com.exeptions.LessonNotFoundException;

import java.util.List;

public interface DemandeAchatService {
    DemandeAchatFormationDto addDemandeAchat(DemandeAchatFormationDto demandeAchatFormationDto) throws DemandeAchatNotFoundException;

    DemandeAchatFormationDto getDemandeAchatById(Long id) throws DemandeAchatNotFoundException ;

    List<DemandeAchatFormationDto> getDemandeAchats();

    void deleteDemandeAchatById(Long id)  throws LessonNotFoundException;
    DemandeAchatFormationDto updateStatut(Long id, String statut);

    List<ModuleDto> getAcceptedModulesForApprenant(Long apprenantId);

    boolean hasAccess(Long apprenantId, Long moduleId);

}
