package com.controllers;

import com.Services.FormateurService;
import com.configImage.ImageStorage;
import com.dto.ApprenantDto;
import com.dto.FormateurDto;
import com.entities.Apprenant;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;




@RestController
@RequestMapping("/api/v1/formateur")
@RequiredArgsConstructor
@Log
public class FormateurController {

    private final FormateurService formateurService;
    private final ImageStorage imageStorage;



    @PostMapping("/addformateur")
    public ResponseEntity<FormateurDto> addFormateur(@RequestBody FormateurDto formateurDto) {
        return new ResponseEntity<>(formateurService.addFormateur(formateurDto), HttpStatus.CREATED);
    }

    @GetMapping("/getformateurbyid/{id}")
    public ResponseEntity<FormateurDto> getFormateurById(@PathVariable Long id) {
        return ResponseEntity.ok(formateurService.getFormateurById(id));
    }

    @GetMapping("/getallformateurs")
    public ResponseEntity<List<FormateurDto>> getAllAgents() {
        return new ResponseEntity<>(formateurService.getFormateurs(), HttpStatus.OK);
    }


    @DeleteMapping("/deleteformateur/{id}")
    public ResponseEntity<Void> deleteFormateurById(@PathVariable Long id) {
        formateurService.deleteFormateurById(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/updateformateur/{id}")
    public ResponseEntity<FormateurDto> updateFormateur(@PathVariable Long id,
                                                        @RequestBody FormateurDto formateurDto) {
        return ResponseEntity.ok(formateurService.updateFormateur(id, formateurDto));
    }


    @PutMapping("/change-password/{id}")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id,
                                                              @RequestParam String currentPassword,
                                                              @RequestParam String newPassword) {
        String result = formateurService.changePassword(id, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", result));
    }



    @PutMapping("/update-email/{id}")
    public ResponseEntity<String> updateEmail(@PathVariable Long id,
                                              @RequestParam String newEmail) {
        return ResponseEntity.ok(formateurService.updateEmail(id, newEmail));
    }


    @PostMapping(path = "/uploadImage/{IdFormateurr}" , consumes = MULTIPART_FORM_DATA_VALUE)
    public FormateurDto uploadFormateurImage(@PathVariable("IdFormateurr")  Long IdFormateur,
                                               @RequestPart(value = "image") MultipartFile image) {
        return formateurService.uploadFormateurImage(IdFormateur, image);
    }

    @GetMapping("/downloadformateurimage/{imageName}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String imageName, HttpServletRequest request) {
        return this.imageStorage.downloadUserImage(imageName, request);
    }

    @GetMapping("/{formateurId}/apprenants")
    public ResponseEntity<List<ApprenantDto>> getApprenantsByFormateur(@PathVariable Long formateurId) {
        return ResponseEntity.ok(formateurService.getApprenantsByFormateur(formateurId));
    }

}