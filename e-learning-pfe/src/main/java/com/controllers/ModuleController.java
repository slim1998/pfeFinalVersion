package com.controllers;

import com.Services.DemandeAchatService;
import com.Services.ModuleService;
import com.configImage.ImageStorage;
import com.dto.ModuleDto;
import com.exeptions.ModuleNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
@RestController
@RequestMapping("/api/v1/module")
@RequiredArgsConstructor
@Log
public class ModuleController {
    private final ModuleService moduleService;
    private final ImageStorage imageStorage;
    private final DemandeAchatService demandeAchatService;


    @PostMapping("/addmodule")
    public ResponseEntity<ModuleDto> addModule(@RequestBody final ModuleDto moduleDto) {
        try {
            ModuleDto savedModule = moduleService.addModule(moduleDto);
            return new ResponseEntity<>(savedModule, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Affiche le vrai message de l'exception
            log.info("Erreur lors de la création du module : " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/getmodulebyid/{id}")
    public ResponseEntity<ModuleDto> getModuleById(@PathVariable("id") final Long id) {
        try {
            return new ResponseEntity<>(moduleService.getModuleById(id), HttpStatus.OK);
        } catch (ModuleNotFoundException e) {
            log.info(String.format("Module with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getallmodules")
    public ResponseEntity<List<ModuleDto>> getAllModules() {
        return new ResponseEntity<>(moduleService.getModules(), HttpStatus.OK);
    }


//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<Void> deleteModuleById(@PathVariable("id") final Long id) {
//        try {
//            moduleService.deleteModuleById(id);
//            return new ResponseEntity<>(HttpStatus.OK);
//        } catch (ModuleNotFoundException e) {
//            log.info(String.format("module with id = %s not found", id));
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//    }
@DeleteMapping("/delete/{id}")
public ResponseEntity<Void> deleteModuleById(@PathVariable Long id) {
    try {
        moduleService.deleteModuleById(id);
        return ResponseEntity.ok().build();
    } catch (ModuleNotFoundException e) {
        return ResponseEntity.notFound().build();
    }
}


    @PostMapping(path = "/uploadImage/{IdModule}" , consumes = MULTIPART_FORM_DATA_VALUE)
    public ModuleDto uploadModuleImage(@PathVariable("IdModule")  Long IdModule,
                                             @RequestPart(value = "image") MultipartFile image) {
        return moduleService.uploadModuleImage(IdModule, image);
    }

    @GetMapping("/downloadmoduleimage/{imageName}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String imageName, HttpServletRequest request) {
        try {
            // Décoder l'URL correctement
            String decodedImageName = URLDecoder.decode(imageName, StandardCharsets.UTF_8);

            // Log pour debug
            System.out.println("Nom d'image demandé: " + decodedImageName);

            // Configuration du chemin d'images (adaptez selon votre configuration)
            Path imagePath = Paths.get("uploads/images/").resolve(decodedImageName).normalize();

            // Vérifications de sécurité
            if (!imagePath.startsWith(Paths.get("uploads/images/"))) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + decodedImageName + "\"")
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                System.out.println("Fichier non trouvé: " + imagePath.toString());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping(path ="/uploadvideo/{IdModule}" , consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ModuleDto> uploadVideo(
            @PathVariable ("IdModule") Long IdModule,
            @RequestParam(value = "video") MultipartFile video) {
        return ResponseEntity.ok(moduleService.uploadModuleVideo(IdModule, video));
    }



    @GetMapping("/downloadmodulevideo/{videoName}")
    public ResponseEntity<Resource> downloadVideo(@PathVariable String videoName, HttpServletRequest request) {
        return this.imageStorage.downloadUserVideo(videoName, request);
    }

    @PutMapping("/updatemodule/{id}")
    public ResponseEntity<ModuleDto> updateModule(@PathVariable Long id, @RequestBody ModuleDto moduleDto) {
        try {
            ModuleDto updated = moduleService.updateModule(id, moduleDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    
    @GetMapping("/getModuleByFormateur/{formateurId}")
    public List<ModuleDto> getModulesByFormateur(@PathVariable Long formateurId) {
        return moduleService.getModulesByFormateurId(formateurId);
    }

    @GetMapping("/getmodulebycategoryid/{categorieId}")
    public List<ModuleDto> getModulesByCategoryId(@PathVariable Long categorieId) {
        return moduleService.getModulesByCategorieId(categorieId);
    }




    @GetMapping("/countByFormateur/{formateurId}")
    public Long getNombreFormationsByFormateur(@PathVariable Long formateurId) {
        return moduleService.getNombreFormationsByFormateur(formateurId);
    }


    @GetMapping("/formationachetes/{apprenantId}")
    public ResponseEntity<List<ModuleDto>> getAcceptedModules(@PathVariable Long apprenantId) {
        List<ModuleDto> modules = demandeAchatService.getAcceptedModulesForApprenant(apprenantId);
        return ResponseEntity.ok(modules);
    }
}
