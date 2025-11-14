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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private  final CategorieRepository categorieRepository;
    private final ImageStorage imageStorage;
    private final FormateurRepository formateurRepository;


    @Override
    public ModuleDto addModule(ModuleDto moduleDto) {

        System.out.println("=== ADD MODULE DEBUG ===");
        System.out.println("Module titre: " + moduleDto.getTitre());
        System.out.println("Nombre de chapitres: " + (moduleDto.getChapitres() != null ? moduleDto.getChapitres().size() : 0));

        // ✅ Vérifier que la catégorie est présente
        if (moduleDto.getCategorieId() == null) {
            throw new IllegalArgumentException("categorieId ne peut pas être null");
        }

        // Récupérer la catégorie
        Categorie categorie = categorieRepository.findById(moduleDto.getCategorieId())
                .orElseThrow(() -> new RuntimeException(
                        "Categorie avec id = " + moduleDto.getCategorieId() + " non trouvée"));

        // Créer le module à partir du DTO (SANS chapitres pour l'instant)
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

        // Associer la catégorie
        module.setCategorie(categorie);

        // Vérifier et associer le formateur si présent
        if (moduleDto.getFormateurId() != null) {
            Formateur formateur = formateurRepository.findById(moduleDto.getFormateurId())
                    .orElseThrow(() -> new RuntimeException(
                            "Formateur avec id = " + moduleDto.getFormateurId() + " non trouvé"));
            module.setFormateur(formateur);
        }

        // ✅ Calculer le prix final
        double prixInitial = module.getPrixInitial();
        int discount = module.getDiscount();
        double prixFinal = prixInitial - (prixInitial * discount / 100.0);
        module.setPrixFinal(prixFinal);

        // ✅ IMPORTANT: Initialiser la liste des chapitres
        module.setChapitres(new ArrayList<>());

        // ✅ TRAITER LES CHAPITRES ET LESSONS SI PRÉSENTS
        if (moduleDto.getChapitres() != null && !moduleDto.getChapitres().isEmpty()) {
            System.out.println("=== PROCESSING CHAPTERS ===");

            for (ChapitreDto chapitreDto : moduleDto.getChapitres()) {
                System.out.println("Processing chapter: " + chapitreDto.getTitre());

                // Créer le chapitre
                Chapitre chapitre = new Chapitre();
                chapitre.setTitre(chapitreDto.getTitre());
                chapitre.setOrdre(chapitreDto.getOrdre());

                // ✅ Associer le module au chapitre
                chapitre.setModule(module);

                // ✅ Initialiser la liste des lessons
                chapitre.setLessons(new ArrayList<>());

                // ✅ TRAITER LES LESSONS SI PRÉSENTES
                if (chapitreDto.getLessons() != null && !chapitreDto.getLessons().isEmpty()) {
                    System.out.println("Processing " + chapitreDto.getLessons().size() + " lessons for chapter: " + chapitreDto.getTitre());

                    for (LessonDto lessonDto : chapitreDto.getLessons()) {
                        System.out.println("  - Creating lesson: " + lessonDto.getTitre());

                        // Créer la lesson
                        Lesson lesson = new Lesson();
                        lesson.setTitre(lessonDto.getTitre());
                        lesson.setContenu(lessonDto.getContenu() != null ? lessonDto.getContenu() : "");
                        lesson.setDescription(lessonDto.getDescription() != null ? lessonDto.getDescription() : "");
                        lesson.setDuree(lessonDto.getDuree());
                        lesson.setOrdre(lessonDto.getOrdre());

                        // ✅ Associer le chapitre à la lesson
                        lesson.setChapitre(chapitre);

                        // ✅ Ajouter la lesson au chapitre
                        chapitre.getLessons().add(lesson);

                        System.out.println("  ✓ Lesson created: " + lesson.getTitre());
                    }
                }

                // ✅ Ajouter le chapitre au module
                module.getChapitres().add(chapitre);

                System.out.println("✓ Chapter added: " + chapitre.getTitre() + " with " + chapitre.getLessons().size() + " lessons");
            }
        }

        // ✅ Sauvegarder le module (cascade persiste les chapitres et lessons)
        System.out.println("=== SAVING MODULE ===");
        Module savedModule = moduleRepository.save(module);

        System.out.println("✓ Module saved with ID: " + savedModule.getId());
        System.out.println("✓ Number of chapters: " + savedModule.getChapitres().size());

        // Vérifier les lessons
        savedModule.getChapitres().forEach(chap -> {
            System.out.println("  - Chapter: " + chap.getTitre() + " has " + chap.getLessons().size() + " lessons");
            chap.getLessons().forEach(les -> {
                System.out.println("    * Lesson: " + les.getTitre() + " (ID: " + les.getId() + ")");
            });
        });

        System.out.println("========================");

        // Retourner le DTO
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
        return modules.stream().map(ModuleDto::toDto).toList(); // Java 21 or Above
    }

//    @Override
//    public void deleteModuleById(Long id)  {
//        getModuleById(id);
//        moduleRepository.deleteById(id);
//
//    }


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

        // Mettre à jour les champs simples
        module.setTitre(moduleDto.getTitre());
        module.setShort_description(moduleDto.getShort_description());
        module.setLong_description(moduleDto.getLong_description());
        module.setLevel(ModuleDto.convertStringToLevel(moduleDto.getLevel()));
        module.setLectureTime(moduleDto.getLectureTime());

        // ✅ NE PAS ÉCRASER L'IMAGE/VIDEO SI NULL
        if (moduleDto.getImage() != null && !moduleDto.getImage().isEmpty()) {
            module.setImage(moduleDto.getImage());
        }
        // Sinon, on garde l'ancienne valeur (ne rien faire)

        if (moduleDto.getVideo() != null && !moduleDto.getVideo().isEmpty()) {
            module.setVideo(moduleDto.getVideo());
        }
        // Sinon, on garde l'ancienne valeur (ne rien faire)

        module.setPrixInitial(moduleDto.getPrixInitial());
        module.setDiscount(moduleDto.getDiscount() != null ? moduleDto.getDiscount() : 0);
        module.setPrixFinal(moduleDto.getPrixFinal());
        module.setCanAccess(moduleDto.isCanAccess());

        // ... reste du code pour chapitres et lessons

        Module saved = moduleRepository.save(module);
        return ModuleDto.toDto(saved);
    }




    public ResponseEntity<Module> findbyId(Long id) {
        if (id == null) {
            return null;
        }
        return ResponseEntity.ok(moduleRepository.findById(id).get());

    }

    @Override
    public ModuleDto uploadModuleImage(Long IdBlog, MultipartFile image) {

        ResponseEntity<Module> moduleResponse = this.findbyId(IdBlog);
        String imageName=imageStorage.store(image);

        String fileImageDownloadUrl= ServletUriComponentsBuilder.fromCurrentContextPath().path("api/v1/module/downloadmoduleimage/").path(imageName).toUriString();

        Module module = moduleResponse.getBody();

        if (module!=null)
            module.setImage(fileImageDownloadUrl);

        Module modulesaved = moduleRepository.save(module);
        new ModuleDto();
        return  ModuleDto.toDto(modulesaved);
    }
    @Override
    public ModuleDto uploadModuleVideo(Long idModule, MultipartFile video) {
        ResponseEntity<Module> moduleResponse = this.findbyId(idModule);

        // 1. Stocker le fichier vidéo avec imageStorage (il gère déjà MultipartFile)
        String videoName = imageStorage.store(video);

        // 2. Génération de l’URL de téléchargement
        String fileVideoDownloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("api/v1/module/downloadmodulevideo/")
                .path(videoName)
                .toUriString();

        // 3. Mise à jour de la formation
        Module module = moduleResponse.getBody();
        if (module != null) {
            module.setVideo(fileVideoDownloadUrl);
        }

        // 4. Sauvegarde
       Module moduleSaved = moduleRepository.save(module);

        // 5. Retourner DTO
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
