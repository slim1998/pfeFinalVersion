
package com.Services.Impl;
import com.dto.CertificationDto;
import com.entities.Apprenant;
import com.entities.Certification;
import com.entities.Module;



import com.exeptions.CertificationNotFoundException;


import com.repositories.ApprenantRepository;
import com.repositories.CertificationRepository;
import com.repositories.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificationServiceImpl implements com.Services.CertificationService {

    private final CertificationRepository certificationRepository;
    private final ModuleRepository moduleRepository;
    private final ApprenantRepository apprenantRepository; // Ajout du repository

    @Override
    public CertificationDto addCerification(CertificationDto certificationDto) throws CertificationNotFoundException {
        try {
            // Vérifier si le module existe
            Module module = moduleRepository.findById(certificationDto.getModuleId())
                    .orElseThrow(() -> new CertificationNotFoundException("Module non trouvé avec ID: " + certificationDto.getModuleId()));

            // Vérifier si l'apprenant existe
            Apprenant apprenant = apprenantRepository.findById(certificationDto.getApprenantId())
                    .orElseThrow(() -> new CertificationNotFoundException("Apprenant non trouvé avec ID: " + certificationDto.getApprenantId()));

            // Vérifier si une certification existe déjà pour ce module et cet apprenant
            boolean existingCertification = certificationRepository.existsByApprenant_IdAndModule_Id(
                    certificationDto.getApprenantId(),
                    certificationDto.getModuleId()
            );

            if (existingCertification) {
                throw new CertificationNotFoundException("Une certification existe déjà pour cet apprenant et ce module");
            }

            Certification certification = CertificationDto.toEntity(certificationDto);
            certification.setModule(module);
            certification.setApprenant(apprenant);

            // Définir la date d'obtention si elle n'est pas fournie
//            if (certification.getDateObtention() == null) {
//                certification.setDateObtention(LocalDateTime.now());
//            }

            Certification saved = certificationRepository.save(certification);
            return CertificationDto.toDto(saved);

        } catch (CertificationNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la certification: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CertificationDto> getCertifications() {
        return certificationRepository.findAll()
                .stream()
                .map(CertificationDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CertificationDto> getCertificationsByModuleId(Long moduleId) throws CertificationNotFoundException {
        try {
            List<Certification> certifications = certificationRepository.findByModule_Id(moduleId);
            return certifications.stream()
                    .map(CertificationDto::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new CertificationNotFoundException("Erreur lors de la récupération des certifications pour le module: " + moduleId);
        }
    }

    @Override
    public List<CertificationDto> getCertificationsByApprenantId(Long apprenantId) throws CertificationNotFoundException {
        try {
            List<Certification> certifications = certificationRepository.findByApprenant_Id(apprenantId);
            return certifications.stream()
                    .map(CertificationDto::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new CertificationNotFoundException("Erreur lors de la récupération des certifications pour l'apprenant: " + apprenantId);
        }
    }
@Override
    public List<CertificationDto> getCertificationsByFormateurId(Long formateurId) {
        List<Certification> certifications = certificationRepository.findByFormateurId(formateurId);

        return certifications.stream()
                .map(CertificationDto::toDto)
                .collect(Collectors.toList());
    }


}

