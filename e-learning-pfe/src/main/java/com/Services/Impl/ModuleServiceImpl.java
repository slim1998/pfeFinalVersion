package com.Services.Impl;

import com.Services.ModuleService;
import com.configImage.ImageStorage;
import com.dto.CategorieDto;
import com.dto.ChapitreDto;
import com.dto.LessonDto;
import com.dto.ModuleDto;
import com.entities.*;
import com.entities.Module;
import com.exeptions.ModuleNotFoundException;
import com.repositories.CategorieRepository;
import com.repositories.FormateurRepository;
import com.repositories.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CategorieRepository categorieRepository;
    private final ImageStorage imageStorage;
    private final FormateurRepository formateurRepository;

    // ... keep all your existing methods EXCEPT the problematic one

    @Override
    public ModuleDto addModule(ModuleDto moduleDto) {
        // ... your existing addModule method
    }

    @Override
    public ModuleDto getModuleById(Long id)  {
        Module module = moduleRepository.findById(id).orElseThrow();
        return ModuleDto.toDto(module);
    }

    @Override
    public List<ModuleDto> getModules() {
        List<Module> modules = moduleRepository.findAll();
        return modules.stream().map(ModuleDto::toDto).toList();
    }

    // REMOVE THIS METHOD - it's causing the error
    // @Override
    // public String uploadModuleImage(MultipartFile file, Long moduleId) {
    //     try {
    //         Module module = moduleRepository.findById(moduleId)
    //             .orElseThrow(() -> new RuntimeException("Module not found"));
    //         
    //         if (file == null || file.isEmpty()) {
    //             throw new RuntimeException("No file provided");
    //         }
    //         
    //         String fileName = imageStorage.store(file);
    //         module.setImage(fileName);
    //         moduleRepository.save(module);
    //         
    //         return fileName;
    //     } catch (Exception e) {
    //         throw new RuntimeException("Failed to upload image: " + e.getMessage());
    //     }
    // }

    @Override
    public void deleteModuleById(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ModuleNotFoundException("Module avec ID " + id + " introuvable");
        }
        moduleRepository.deleteById(id);
    }

    @Override
    public ModuleDto updateModule(Long id, ModuleDto moduleDto) {
        // ... your existing updateModule method
    }

    public ResponseEntity<Module> findbyId(Long id) {
        // ... your existing findbyId method
    }

    @Override
    public ModuleDto uploadModuleImage(Long IdBlog, MultipartFile image) {
        // ... your existing uploadModuleImage method
    }

    @Override
    public ModuleDto uploadModuleVideo(Long idModule, MultipartFile video) {
        // ... your existing uploadModuleVideo method
    }

    @Override
    public List<ModuleDto> getModulesByFormateurId(Long formateurId) {
        return moduleRepository.findByFormateurId(formateurId)
                .stream()
                .map(ModuleDto::toDto)
                .toList();
    }

    @Override
    public List<ModuleDto> getModulesByCategorieId(Long categorieId) {
        return moduleRepository.findByCategorieId(categorieId)
                .stream()
                .map(ModuleDto::toDto)
                .toList();
    }

    @Override
    public Long getNombreFormationsByFormateur(Long formateurId) {
        return moduleRepository.countByFormateurId(formateurId);
    }
}