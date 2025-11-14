package com.controllers;

import com.Services.ChapitreService;
import com.dto.ChapitreDto;
import com.exeptions.ChapitreNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/v1/chapitre")
@RequiredArgsConstructor
@Log
public class ChapitreController {


    private final ChapitreService chapitreService;


    @PostMapping("/save")
    public ResponseEntity<ChapitreDto> createChapitre(@RequestBody ChapitreDto chapitreDto) {
        try {
            // ✅ Log pour debug
            System.out.println("=== RECEIVED CHAPITRE DTO ===");
            System.out.println("Titre: " + chapitreDto.getTitre());
            System.out.println("Ordre: " + chapitreDto.getOrdre());
            System.out.println("ModuleId: " + chapitreDto.getModuleId());
            System.out.println("==============================");

            ChapitreDto created = chapitreService.addChapitre(chapitreDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("❌ Error creating chapitre: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getall")
    public ResponseEntity<List<ChapitreDto>> getAll() {
        return ResponseEntity.ok(chapitreService.getChapitres());
    }

//    @PutMapping("/update/{id}")
//    public ResponseEntity<ChapitreDto> update(@PathVariable Long id, @RequestBody ChapitreDto dto) {
//        return ResponseEntity.ok(chapitreService.updateChapitre(id, dto));
//    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        chapitreService.deleteChapitreById(id);
        return ResponseEntity.noContent().build();
    }

//    @GetMapping("/getchapitrebymodule/{moduleId}")
//    public ResponseEntity<List<ChapitreDto>> getByModule(@PathVariable Long moduleId) {
//        return ResponseEntity.ok(chapitreService.getByModuleId(moduleId));
//    }
//
//
//    @PostMapping(value = "/upload-file/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<ChapitreDto> uploadFile(
//            @PathVariable Long id,
//            @RequestPart("file") MultipartFile file) throws IOException {
//        return ResponseEntity.ok(chapitreService.uploadFile(id, file));
//    }

    @GetMapping("/getchapitrebymodule/{moduleId}")
    public ResponseEntity<List<ChapitreDto>> getChapitresByModuleId(@PathVariable Long moduleId) throws ChapitreNotFoundException {
        List<ChapitreDto> chapitres = chapitreService.getChapitresByModuleId(moduleId);
        return ResponseEntity.ok(chapitres);
    }

}
