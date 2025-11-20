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

    // Remove the configFile field - we'll use only imageStorage
    // private final com.configImage.ConfigFileImpl configFile;

    @Override
    public ModuleDto addModule(ModuleDto moduleDto) {
        System.out.println("=== ADD MODULE DEBUG ===");
        System.out.println("Module titre: " + moduleDto.getTitre());
        System.out.println("Nombre de chapitres: " + (moduleDto.getChapitres() != null ? moduleDto.getChapitres().size() : 0));

        if (moduleDto.getCategorieId() == null) {
            throw new IllegalArgumentException("categorieId ne peut pas être null");
        }

        Categorie categorie = categorieRepository.findById(moduleDto.getCategorieId())
                .orElseThrow(() -> new RuntimeException(
                        "Categorie avec id = " + moduleDto.getCategorieId() + " non trouvée"));

        Module module = new Module();
        module.setTitre(moduleDto.getTitre());
        module.setShort_description(moduleDto.getShort_description());
        module.setLong_description(moduleDto.getLong_description());
        module.setLevel(ModuleDto.convertStringToLevel(moduleDto.getLevel()));
        module.setLectureTime(moduleDto.getLectureTime());
        module.setImage(moduleDto.getImage());
        module.setVideo(moduleDto.getVideo());
        module.setPrixInitial(moduleDto.getPrixInitial());
        module.setDiscount(moduleDto.getDiscount() != null ? moduleDto.getDiscount() : 0);
        module.setCanAccess(moduleDto.isCanAccess());
        module.setCategorie(categorie);

        if (moduleDto.getFormateurId() != null) {
            Formateur formateur = formateurRepository.findById(moduleDto.getFormateurId())
                    .orElseThrow(() -> new RuntimeException(
                            "Formateur avec id = " + moduleDto.getFormateurId() + " non trouvé"));
            module.setFormateur(formateur);
        }

        double prixInitial = module.getPrixInitial();
        int discount = module.getDiscount();
        double prixFinal = prixInitial - (prixInitial * discount / 100.0);
        module.setPrixFinal(prixFinal);
        module.setChapitres(new ArrayList<>());

        if (moduleDto.getChapitres() != null && !moduleDto.getChapitres().isEmpty()) {
            System.out.println("=== PROCESSING CHAPTERS ===");

            for (ChapitreDto chapitreDto : moduleDto.getChapitres()) {
                System.out.println("Processing chapter: " + chapitreDto.getTitre());

                Chapitre chapitre = new Chapitre();
                chapitre.setTitre(chapitreDto.getTitre());
                chapitre.setOrdre(chapitreDto.getOrdre());
                chapitre.setModule(module);
                chapitre.setLessons(new ArrayList<>());

                if (chapitreDto.getLessons() != null && !chapitreDto.getLessons().isEmpty()) {
                    System.out.println("Processing " + chapitreDto.getLessons().size() + " lessons for chapter: " + chapitreDto.getTitre());

                    for (LessonDto lessonDto : chapitreDto.getLessons()) {
                        System.out.println("  - Creating lesson: " + lessonDto.getTitre());

                        Lesson lesson = new Lesson();
                        lesson.setTitre(lessonDto.getTitre());
                        lesson.setContenu(lessonDto.getContenu() != null ? lessonDto.getContenu() : "");
                        lesson.setDescription(lessonDto.getDescription() != null ? lessonDto.getDescription() : "");
                        lesson.setDuree(lessonDto.getDuree());
                        lesson.setOrdre(lessonDto.getOrdre());
                        lesson.setChapitre(chapitre);
                        chapitre.getLessons().add(lesson);

                        System.out.println("  ✓ Lesson created: " + lesson.getTitre());
                    }
                }

                module.getChapitres().add(chapitre);
                System.out.println("✓ Chapter added: " + chapitre.getTitre() + " with " + chapitre.getLessons().size() + " lessons");
            }
        }

        System.out.println("=== SAVING MODULE ===");
        Module savedModule = moduleRepository.save(module);

        System.out.println("✓ Module saved with ID: " + savedModule.getId());
        System.out.println("✓ Number of chapters: " + savedModule.getChapitres().size());

        savedModule.getChapitres().forEach(chap -> {
            System.out.println("  - Chapter: " + chap.getTitre() + " has " + chap.getLessons().size() + " lessons");
            chap.getLessons().forEach(les -> {
                System.out.println("    * Lesson: " + les.getTitre() + " (ID: " + les.getId() + ")");
            });
        });

        System.out.println("========================");

        ModuleDto dto = ModuleDto.toDto(savedModule);
        dto.setPrixFinal(prixFinal);
        return dto;
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

    @Override
    public String uploadModuleImage(MultipartFile file, Long moduleId) {
        try {
            Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
            
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("No file provided");
            }
            
            String fileName = imageStorage.store(file);
            module.setImage(fileName);
            moduleRepository.save(module);
            
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    // REMOVED: validateFileExists method - it's not in the interface

    @Override
    public void deleteModuleById(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ModuleNotFoundException("Module avec ID " + id + " introuvable");
        }
        moduleRepository.deleteById(id);
    }

    @Override
    public ModuleDto updateModule(Long id, ModuleDto moduleDto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        module.setTitre(moduleDto.getTitre());
        module.setShort_description(moduleDto.getShort_description());
        module.setLong_description(moduleDto.getLong_description());
        module.setLevel(ModuleDto.convertStringToLevel(moduleDto.getLevel()));
        module.setLectureTime(moduleDto.getLectureTime());

        if (moduleDto.getImage() != null && !moduleDto.getImage().isEmpty()) {
            module.setImage(moduleDto.getImage());
        }

        if (moduleDto.getVideo() != null && !moduleDto.getVideo().isEmpty()) {
            module.setVideo(moduleDto.getVideo());
        }

        module.setPrixInitial(moduleDto.getPrixInitial());
        module.setDiscount(moduleDto.getDiscount() != null ? moduleDto.getDiscount() : 0);
        
        double prixInitial = module.getPrixInitial();
        int discount = module.getDiscount();
        double prixFinal = prixInitial - (prixInitial * discount / 100.0);
        module.setPrixFinal(prixFinal);
        
        module.setCanAccess(moduleDto.isCanAccess());

        Module saved = moduleRepository.save(module);
        return ModuleDto.toDto(saved);
    }

    public ResponseEntity<Module> findbyId(Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        return ResponseEntity.ok(module);
    }

    @Override
    public ModuleDto uploadModuleImage(Long IdBlog, MultipartFile image) {
        ResponseEntity<Module> moduleResponse = this.findbyId(IdBlog);
        
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("No image provided");
        }
        
        String imageName = imageStorage.store(image);

        String fileImageDownloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("api/v1/module/downloadmoduleimage/")
                .path(imageName)
                .toUriString();

        Module module = moduleResponse.getBody();

        if (module != null) {
            module.setImage(fileImageDownloadUrl);
        }

        Module modulesaved = moduleRepository.save(module);
        return ModuleDto.toDto(modulesaved);
    }

    @Override
    public ModuleDto uploadModuleVideo(Long idModule, MultipartFile video) {
        ResponseEntity<Module> moduleResponse = this.findbyId(idModule);

        if (video == null || video.isEmpty()) {
            throw new RuntimeException("No video provided");
        }

        String videoName = imageStorage.store(video);

        String fileVideoDownloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("api/v1/module/downloadmodulevideo/")
                .path(videoName)
                .toUriString();

        Module module = moduleResponse.getBody();
        if (module != null) {
            module.setVideo(fileVideoDownloadUrl);
        }

        Module moduleSaved = moduleRepository.save(module);
        return ModuleDto.toDto(moduleSaved);
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