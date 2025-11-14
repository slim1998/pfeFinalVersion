package com.Services.Impl;
import com.dto.LessonDto;
import com.entities.Lesson;
import com.entities.Module;
import com.Services.ChapitreService;
import com.dto.ChapitreDto;
import com.entities.Chapitre;
import com.exeptions.ChapitreNotFoundException;
import com.filestorage.FileStorageService;
import com.repositories.ChapitreRepository;

import com.repositories.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ChapitreServiceImpl implements ChapitreService {


    private final ChapitreRepository chapitreRepository;
   private final ModuleRepository moduleRepository;
   
    @Override
    public ChapitreDto addChapitre(ChapitreDto chapitreDto) {
        // ✅ VÉRIFICATION CRITIQUE: moduleId doit être présent
        if (chapitreDto.getModuleId() == null || chapitreDto.getModuleId() == 0) {
            throw new IllegalArgumentException(
                    "moduleId est requis et ne peut pas être null ou 0. Valeur reçue: " + chapitreDto.getModuleId()
            );
        }

        // ✅ Récupérer le module
        Module module = moduleRepository.findById(chapitreDto.getModuleId())
                .orElseThrow(() -> new RuntimeException(
                        "Module avec id = " + chapitreDto.getModuleId() + " non trouvé"
                ));

        // ✅ Créer le chapitre
        Chapitre chapitre = new Chapitre();
        chapitre.setTitre(chapitreDto.getTitre());
        chapitre.setOrdre(chapitreDto.getOrdre());

        // ✅ IMPORTANT: Associer le module AVANT de sauvegarder
        chapitre.setModule(module);

        // ✅ Sauvegarder
        Chapitre savedChapitre = chapitreRepository.save(chapitre);

        // ✅ Log pour debug
        System.out.println("=== CHAPITRE CREATED ===");
        System.out.println("Chapitre ID: " + savedChapitre.getId());
        System.out.println("Chapitre titre: " + savedChapitre.getTitre());
        System.out.println("Module ID: " + savedChapitre.getModule().getId());
        System.out.println("========================");

        // ✅ Retourner DTO
        return ChapitreDto.toDto(savedChapitre);
    }

    @Override
    public ChapitreDto getChapitreById(Long id) throws ChapitreNotFoundException {
        return chapitreRepository.findById(id)
                .map(ChapitreDto::toDto)
                .orElseThrow(() -> new ChapitreNotFoundException("Chapitre avec id " + id + " introuvable"));
    }

    @Override
    public List<ChapitreDto> getChapitres() {
        return chapitreRepository.findAll()
                .stream()
                .map(ChapitreDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteChapitreById(Long id) throws ChapitreNotFoundException {
        if (!chapitreRepository.existsById(id)) {
            throw new ChapitreNotFoundException("Chapitre avec id " + id + " introuvable");
        }
        chapitreRepository.deleteById(id);
    }
    @Override
    public List<ChapitreDto> getChapitresByModuleId(Long moduleId) throws ChapitreNotFoundException {
        List<Chapitre> chapitres = chapitreRepository.findByModuleId(moduleId);
        if (chapitres.isEmpty()) {
            throw new ChapitreNotFoundException("Aucun chapitre trouvé pour le module id: " + moduleId);
        }
        return chapitres.stream().map(ChapitreDto::toDto).collect(Collectors.toList());
    }



}
