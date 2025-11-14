package com.securite.service;




import com.dto.AdministrateurDto;
import com.securite.models.Administrateur;

import java.util.List;

public interface AdministrateurService {

    AdministrateurDto addAdministrateur(AdministrateurDto administrateurDto) ;

    AdministrateurDto getAdministrateurById(Long id) ;

    public List<AdministrateurDto> getAdministrateurs();

    void deleteAdministrateurById(Long id) ;
}
