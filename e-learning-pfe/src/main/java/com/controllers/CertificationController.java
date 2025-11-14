package com.controllers;

import com.Services.CertificationService;
import com.dto.CertificationDto;
import com.exeptions.CertificationNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/certifications")



@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    // ➕ Ajouter une certification
    @PostMapping("/addcertification")
    public ResponseEntity<CertificationDto> addCertification(@RequestBody CertificationDto certificationDto) {
        try {
            CertificationDto saved = certificationService.addCerification(certificationDto);
            return ResponseEntity.ok(saved);
        } catch (CertificationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 📋 Récupérer toutes les certifications
    @GetMapping("/getallcertification")
    public ResponseEntity<List<CertificationDto>> getAllCertifications() {
        try {
            List<CertificationDto> certifications = certificationService.getCertifications();
            return ResponseEntity.ok(certifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 📌 Récupérer les certifications par module
    @GetMapping("/getcertificationbymodule/{moduleId}")
    public ResponseEntity<List<CertificationDto>> getCertificationsByModule(@PathVariable Long moduleId) {
        try {
            List<CertificationDto> certifications = certificationService.getCertificationsByModuleId(moduleId);
            return ResponseEntity.ok(certifications);
        } catch (CertificationNotFoundException e) {
            // Retourner une liste vide au lieu d'une erreur pour ce cas
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 👨‍🎓 Récupérer les certifications par apprenant
    @GetMapping("/getcertificationbyapprenant/{apprenantId}")
    public ResponseEntity<List<CertificationDto>> getCertificationsByApprenant(@PathVariable Long apprenantId) {
        try {
            List<CertificationDto> certifications = certificationService.getCertificationsByApprenantId(apprenantId);
            return ResponseEntity.ok(certifications);
        } catch (CertificationNotFoundException e) {
            // Retourner une liste vide au lieu d'une erreur - normal pour un nouvel utilisateur
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/getcertificationbyformateur/{formateurId}")
    public ResponseEntity<List<CertificationDto>> getCertificationsByFormateur(@PathVariable Long formateurId) {
        try {
            List<CertificationDto> certifications = certificationService.getCertificationsByFormateurId(formateurId);
            return ResponseEntity.ok(certifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


}

