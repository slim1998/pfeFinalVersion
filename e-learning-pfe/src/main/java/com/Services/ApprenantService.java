package com.Services;

import com.dto.ApprenantDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ApprenantService {

    ApprenantDto getApprenantById(Long id);

    public List<ApprenantDto> getApprenants();

    void deleteApprenantById(Long id) ;

    ApprenantDto uploadApprenantImage(Long IdApprenant, MultipartFile image);

    ApprenantDto updateApprenant(Long id, ApprenantDto apprenantDto) ;

    String changePassword(Long id, String currentPassword, String newPassword);

    String updateEmail(Long id, String newEmail);
    ApprenantDto updateUserStatus(Long id, boolean status);



}
