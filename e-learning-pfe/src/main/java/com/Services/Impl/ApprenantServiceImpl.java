package com.Services.Impl;

import com.Services.ApprenantService;
import com.configImage.ImageStorage;
import com.dto.ApprenantDto;
import com.entities.Apprenant;
import com.repositories.ApprenantRepository;
import com.securite.models.User;
import com.securite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.NoSuchElementException;
@Service
@RequiredArgsConstructor
public class ApprenantServiceImpl implements ApprenantService {


    private final ApprenantRepository apprenantRepository;
    private final ImageStorage imageStorage;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;






    @Override
    public ApprenantDto getApprenantById(Long id) {
        Apprenant apprenant = apprenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apprenant introuvable avec l'id : " + id));
        return ApprenantDto.toDto(apprenant);
    }

    @Override
    public List<ApprenantDto> getApprenants() {
        List<Apprenant> apprenants = apprenantRepository.findAll();
        return apprenants.stream().map(ApprenantDto::toDto).toList();
    }

    @Override
    public void deleteApprenantById(Long id)  {
        getApprenantById(id);
        apprenantRepository.deleteById(id);

    }




    @Override
    public ApprenantDto updateApprenant(Long id, ApprenantDto apprenantDto) {
        Apprenant existingApprenant = apprenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apprenant non trouvé avec l'ID : " + id));

        existingApprenant.setFirstName(apprenantDto.getFirstName());
        existingApprenant.setLastName(apprenantDto.getLastName());
        existingApprenant.setEmail(apprenantDto.getEmail());
        existingApprenant.setPhone(apprenantDto.getPhone());
        existingApprenant.setPhoto(apprenantDto.getPhoto());
        existingApprenant.setAdress(apprenantDto.getAdress());

        if (apprenantDto.getPassword() != null && !apprenantDto.getPassword().isEmpty()) {
            existingApprenant.setPassword(passwordEncoder.encode(apprenantDto.getPassword()));
        }

        Apprenant updatedApprenant = apprenantRepository.save(existingApprenant);
        return ApprenantDto.toDto((updatedApprenant));

    }





    @Override
    public String changePassword(Long id, String currentPassword, String newPassword) {
        Apprenant apprenant = apprenantRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Apprenant not found"));

        if (!passwordEncoder.matches(currentPassword, apprenant.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        apprenant.setPassword(passwordEncoder.encode(newPassword));
        apprenantRepository.save(apprenant);

        return "Password updated successfully";
    }



    @Override
    public String updateEmail(Long id, String newEmail) {
        Apprenant apprenant = apprenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apprenant not found"));

        // Optionnel : vérifier si l'email existe déjà
        if (apprenantRepository.findByEmail(newEmail).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        apprenant.setEmail(newEmail);
        apprenantRepository.save(apprenant);

        return "Email updated successfully";
    }

    public ResponseEntity<Apprenant> findbyId(Long id) {
        if (id == null) {
            return null;
        }
        return ResponseEntity.ok(apprenantRepository.findById(id).get());

    }

    @Override
    public ApprenantDto uploadApprenantImage(Long IdApprenant, MultipartFile image) {

        ResponseEntity<Apprenant> apprenantResponse = this.findbyId(IdApprenant);
        String imageName=imageStorage.store(image);

        String fileImageDownloadUrl= ServletUriComponentsBuilder.fromCurrentContextPath().path("api/v1/apprenant/downloadapprenantimage/").path(imageName).toUriString();

        Apprenant apprenant = apprenantResponse.getBody();

        if (apprenant!=null)
            apprenant.setPhoto(fileImageDownloadUrl);

        Apprenant apprenantsaved = apprenantRepository.save(apprenant);
        new ApprenantDto();
        return  ApprenantDto.toDto(apprenantsaved);
    }



    @Override
    public ApprenantDto updateUserStatus(Long id, boolean status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));

        // ✅ Mise à jour du statut
        user.setEnabled(status);
        User savedUser = userRepository.save(user);

        // ✅ Vérification si c’est un Apprenant
        if (savedUser instanceof Apprenant apprenant) {
            return ApprenantDto.toDto(apprenant);
        }
        throw new RuntimeException("L'utilisateur avec l'id " + id + " n'est pas un apprenant.");
    }


}
