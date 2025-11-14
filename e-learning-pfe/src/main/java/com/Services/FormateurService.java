package com.Services;

import com.dto.ApprenantDto;
import com.dto.FormateurDto;
import com.entities.Apprenant;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FormateurService {

    FormateurDto addFormateur(FormateurDto formateurDto) ;

    FormateurDto getFormateurById(Long id) ;

    public List<FormateurDto> getFormateurs();

    void deleteFormateurById(Long id) ;

    FormateurDto uploadFormateurImage(Long IdFormateur, MultipartFile image);

    FormateurDto updateFormateur(Long id, FormateurDto formateurDto) ;

    String changePassword(Long id, String currentPassword, String newPassword);

    String updateEmail(Long id, String newEmail);
    List<ApprenantDto> getApprenantsByFormateur(Long formateurId) ;
}
