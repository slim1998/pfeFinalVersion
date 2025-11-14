package com.controllers;


import com.Services.ApprenantService;
import com.Services.DemandeAchatService;
import com.Services.DemandeAchatService;
import com.Services.ModuleService;
import com.configImage.ImageStorage;
import com.dto.DemandeAchatFormationDto;
import com.dto.DemandeAchatFormationDto;
import com.dto.ModuleDto;
import com.entities.Apprenant;
import com.exeptions.DemandeAchatNotFoundException;
import com.exeptions.DemandeAchatNotFoundException;
import com.repositories.ApprenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/demandeachat")
@RequiredArgsConstructor
@Log
public class DemandeAchatController {


    private final DemandeAchatService demandeAchatService;
    private final ApprenantRepository apprenantRepository;
    private final ModuleService moduleService;




    @PostMapping("/addDemande")
    public ResponseEntity<DemandeAchatFormationDto> addDemande(@RequestBody final DemandeAchatFormationDto demandeAchatFormationDto) {
        try {
            return new ResponseEntity<>(demandeAchatService.addDemandeAchat(demandeAchatFormationDto), HttpStatus.CREATED);
        } catch (DemandeAchatNotFoundException e) {
            log.info(String.format("demande with id = %s not found", demandeAchatFormationDto.getId()));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getdemandebyid/{id}")
    public ResponseEntity<DemandeAchatFormationDto> getDemandeById(@PathVariable("id") final Long id) {
        try {
            return new ResponseEntity<>(demandeAchatService.getDemandeAchatById(id), HttpStatus.OK);
        } catch (DemandeAchatNotFoundException e) {
            log.info(String.format("demande with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
//
//    @PutMapping("/update/{id}")
//    public ResponseEntity<DemandeAchatFormationDto> update(@PathVariable Long id, @RequestBody DemandeAchatFormationDto dto) {
//        return ResponseEntity.ok(demandeAchatService.(id, dto));
//

    @GetMapping("/getallDemande")
    public ResponseEntity<List<DemandeAchatFormationDto>> getAllDemandes() {
        return new ResponseEntity<>(demandeAchatService.getDemandeAchats(), HttpStatus.OK);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDemandeById(@PathVariable("id") final Long id) {
        try {
            demandeAchatService.deleteDemandeAchatById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (DemandeAchatNotFoundException e) {
            log.info(String.format("demande with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/updateStatut/{id}")
    public ResponseEntity<DemandeAchatFormationDto> updateStatut(
            @PathVariable Long id,
            @RequestParam String statut) {

        return ResponseEntity.ok(demandeAchatService.updateStatut(id, statut));
    }




    @GetMapping("/{moduleId}/overview")
    public ResponseEntity<?> getModuleOverview(@PathVariable Long moduleId, Principal principal) {
        Apprenant apprenant = apprenantRepository.findByEmail(principal.getName()).orElseThrow();

        boolean canAccess = demandeAchatService.hasAccess(apprenant.getId(), moduleId);

        ModuleDto dto = moduleService.getModuleById(moduleId);
        dto.setCanAccess(canAccess);

        return ResponseEntity.ok(dto);
    }

}
