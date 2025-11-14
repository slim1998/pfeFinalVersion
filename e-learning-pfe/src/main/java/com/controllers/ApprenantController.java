package com.controllers;

import com.Services.ApprenantService;
import com.configImage.ImageStorage;
import com.dto.ApprenantDto;
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
@RequestMapping("/api/v1/apprenant")
@RequiredArgsConstructor
@Log
public class ApprenantController {





        private final ApprenantService apprenantService;
        private final ImageStorage imageStorage;


    @GetMapping("/getapprenantbyid/{id}")
    public ResponseEntity<ApprenantDto> getApprenantById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(apprenantService.getApprenantById(id));
    }

        @GetMapping("/getallapprenant")
        public ResponseEntity<List<ApprenantDto>> getAllApprenants() {
            return new ResponseEntity<>(apprenantService.getApprenants(), HttpStatus.OK);
        }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApprenantById(@PathVariable("id") Long id) {
        apprenantService.deleteApprenantById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }


    @PutMapping("/updateapprenant/{id}")
    public ResponseEntity<ApprenantDto> updateApprenant(@PathVariable Long id,
                                                        @RequestBody ApprenantDto apprenantDto) {
        ApprenantDto updatedApprenant = apprenantService.updateApprenant(id, apprenantDto);
        return ResponseEntity.ok(updatedApprenant);
    }


        @PutMapping("/change-password/{id}")
        public ResponseEntity<?> changeApprenantPassword(
                @PathVariable Long id,
                @RequestParam String currentPassword,
                @RequestParam String newPassword) {

            try {
                String result = apprenantService.changePassword(id, currentPassword, newPassword);

                Map<String, String> response = new HashMap<>();
                response.put("message", result);

                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } catch (NoSuchElementException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        }



        @PutMapping("/update-email/{id}")
        public ResponseEntity<?> updateEmail(@PathVariable Long id, @RequestParam String newEmail) {
            try {
                String result = apprenantService.updateEmail(id, newEmail);
                return ResponseEntity.ok(result);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
        }


        @PostMapping(path = "/uploadImage/{IdApprenant}" , consumes = MULTIPART_FORM_DATA_VALUE)
        public ApprenantDto uploadApprenatImage(@PathVariable("IdApprenant")  Long IdApprenant,
                                                @RequestPart(value = "image") MultipartFile image) {
            return apprenantService.uploadApprenantImage(IdApprenant, image);
        }

        @GetMapping("/downloadapprenantimage/{imageName}")
        public ResponseEntity<Resource> downloadImage(@PathVariable String imageName, HttpServletRequest request) {
            return this.imageStorage.downloadUserImage(imageName, request);
        }

    @PutMapping("/toggleStatus/{id}")
    public ResponseEntity<ApprenantDto> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean status
    ) {
        ApprenantDto updatedApprenant = apprenantService.updateUserStatus(id, status);
        return ResponseEntity.ok(updatedApprenant);
    }







    }







