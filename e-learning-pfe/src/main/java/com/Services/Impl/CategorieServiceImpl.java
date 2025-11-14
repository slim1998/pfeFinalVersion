package com.Services.Impl;

import com.Services.CategorieService;
import com.dto.CategorieDto;
import com.dto.ChapitreDto;
import com.dto.FormateurDto;
import com.dto.ModuleDto;
import com.entities.Categorie;
import com.configImage.ImageStorage;
import com.entities.Chapitre;
import com.entities.Formateur;
import com.entities.Module;
import com.repositories.CategorieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Slf4j
@Service
@RequiredArgsConstructor
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;
    private final ImageStorage imageStorage;


    @Override
    public CategorieDto addCategorie(CategorieDto categorieDto)  {
        Categorie categorie = CategorieDto.toEntity(categorieDto);
        categorie = categorieRepository.save(categorie);
        return CategorieDto.toDto(categorie);
    }
    @Override
    public CategorieDto updateCategorie(Long id, CategorieDto dto) {

        Categorie existing = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie not found"));

        existing.setNom(dto.getNom());           // ou getTitre() selon ton DTO
        existing.setDescription(dto.getDescription());
        existing.setImage(dto.getImage());       // ou getContenu() selon ton DTO

        return CategorieDto.toDto(categorieRepository.save(existing));
    }


    @Override
    public CategorieDto getCategorieById(Long id)  {
        Categorie categorie = categorieRepository.findById(id).orElseThrow();
        return CategorieDto.toDto(categorie);
    }

    @Override
    public List<CategorieDto> getCategories() {
        List<Categorie> categories = categorieRepository.findAll();
        return categories.stream().map(CategorieDto::toDto).toList(); // Java 21 or Above
    }

    @Override
    public void deleteCategirieById(Long id)  {
        getCategorieById(id);
        categorieRepository.deleteById(id);

    }
    public ResponseEntity<Categorie> findbyId(Long id) {
        if (id == null) {
            return null;
        }
        return ResponseEntity.ok(categorieRepository.findById(id).get());

    }

    @Override
    public CategorieDto uploadCategorieImage(Long IdCategorie, MultipartFile image) {
        log.info("➡️ Début upload image pour catégorie ID: {}", IdCategorie);

        if (image == null || image.isEmpty()) {
            log.error("❌ Aucun fichier reçu pour la catégorie {}", IdCategorie);
            throw new RuntimeException("Image vide ou non fournie");
        }

        // Vérifier si la catégorie existe
        Optional<Categorie> optCategorie = categorieRepository.findById(IdCategorie);
        if (optCategorie.isEmpty()) {
            log.error("❌ Catégorie non trouvée avec ID: {}", IdCategorie);
            throw new RuntimeException("Categorie not found with ID: " + IdCategorie);
        }
        log.info("✅ Catégorie trouvée: {}", optCategorie.get().getNom()); // adapte si `getNom()` existe

        // Stocker l’image
        String imageName = imageStorage.store(image);
        log.info("📸 Image stockée sous le nom: {}", imageName);

        String fileImageDownloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("api/v1/categorie/downloadcategorieimage/")
                .path(imageName)
                .toUriString();

        // Mettre à jour la catégorie
        Categorie categorie = optCategorie.get();
        categorie.setImage(fileImageDownloadUrl);
        log.info("🔗 URL enregistrée dans la catégorie: {}", fileImageDownloadUrl);

        // Sauvegarder
        Categorie categoriesaved = categorieRepository.save(categorie);
        log.info("✅ Catégorie sauvegardée avec image: {}", categoriesaved.getId());

        return CategorieDto.toDto(categoriesaved);
    }


}
