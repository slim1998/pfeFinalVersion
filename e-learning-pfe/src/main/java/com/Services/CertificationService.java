package com.Services;

import com.dto.CertificationDto;

import com.exeptions.CertificationNotFoundException;


import java.util.List;

public interface CertificationService {
    CertificationDto addCerification(CertificationDto certificationDto) throws CertificationNotFoundException;
    List<CertificationDto> getCertifications();

    List<CertificationDto> getCertificationsByModuleId(Long moduleId) throws CertificationNotFoundException;
    List<CertificationDto> getCertificationsByApprenantId(Long moduleId) throws CertificationNotFoundException;
    List<CertificationDto> getCertificationsByFormateurId(Long formateurId);

}
