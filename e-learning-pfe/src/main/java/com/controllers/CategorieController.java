package com.controllers;

import com.Services.CategorieService;
import com.configImage.ImageStorage;
import com.dto.CategorieDto;
import com.dto.ChapitreDto;
import com.dto.ModuleDto;
import com.exeptions.CategorieNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/v1/categorie")
@RequiredArgsConstructor
@Log
public class CategorieController {



    private final CategorieService categorieService;
    private final ImageStorage imageStorage;



    @PostMapping("/addcategorie")
    public ResponseEntity<CategorieDto> addCategorie(@RequestBody final CategorieDto categorieDto) {
        try {
            return new ResponseEntity<>(categorieService.addCategorie(categorieDto), HttpStatus.CREATED);
        } catch (CategorieNotFoundException e) {
            log.info(String.format("caegorie with id = %s not found", categorieDto.getId()));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getcategoriebyid/{id}")
    public ResponseEntity<CategorieDto> getCategorieById(@PathVariable("id") final Long id) {
        try {
            return new ResponseEntity<>(categorieService.getCategorieById(id), HttpStatus.OK);
        } catch (CategorieNotFoundException e) {
            log.info(String.format("categorie with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CategorieDto> update(@PathVariable Long id, @RequestBody CategorieDto dto) {
        return ResponseEntity.ok(categorieService.updateCategorie(id, dto));
    }

    @GetMapping("/getallCategorie")
    public ResponseEntity<List<CategorieDto>> getAllCategories() {
        return new ResponseEntity<>(categorieService.getCategories(), HttpStatus.OK);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCategorieById(@PathVariable("id") final Long id) {
        try {
            categorieService.deleteCategirieById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (CategorieNotFoundException e) {
            log.info(String.format("categorie with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
//    @PostMapping(path = "/uploadImage/{IdCategorie}" , consumes = MULTIPART_FORM_DATA_VALUE)
//    public CategorieDto uploadCategorieImage(@PathVariable("IdCategorie")  Long IdCategorie,
//                                       @RequestPart(value = "image") MultipartFile image) {
//        return categorieService.uploadCategorieImage(IdCategorie, image);
//    }
@PostMapping(path = "/uploadImage/{IdCategorie}", consumes = MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> uploadCategorieImage(
        @PathVariable("IdCategorie") Long IdCategorie,
        @RequestPart(value = "image") MultipartFile image) {
    log.info(String.valueOf(IdCategorie));

    try {
        CategorieDto result = categorieService.uploadCategorieImage(IdCategorie, image);
        log.info("✅ Upload réussi pour catégorie {}");
        return ResponseEntity.ok(result);
    } catch (Exception e) {

        return ResponseEntity.badRequest().body(Map.of(
                "error", "Erreur lors de l'upload de l'image de catégorie",
                "message", e.getMessage(),
                "timestamp", LocalDateTime.now()
        ));
    }
}


    @GetMapping("/downloadcategorieimage/{imageName}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String imageName, HttpServletRequest request) {
        return this.imageStorage.downloadUserImage(imageName, request);
    }
}
