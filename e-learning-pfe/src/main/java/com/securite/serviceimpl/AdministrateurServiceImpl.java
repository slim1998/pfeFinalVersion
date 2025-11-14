package com.securite.serviceimpl;
import com.dto.AdministrateurDto;
import com.securite.models.Administrateur;
import com.securite.models.Erole;
import com.securite.models.Role;
import com.securite.repository.AdministrateurRepository;
import com.securite.repository.RoleRepository;
import com.securite.service.AdministrateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdministrateurServiceImpl implements AdministrateurService {

    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;




    @Override
    public AdministrateurDto addAdministrateur(AdministrateurDto administrateurDto)  {
        Administrateur administrateur = AdministrateurDto.toEntity(administrateurDto);



        String encodedPassword = passwordEncoder.encode(administrateur.getPassword());
        administrateur.setPassword(encodedPassword);

        List<Role> roles = new ArrayList<>();
        Role userRole = roleRepository.findByName("administrateur")
                .orElseThrow(() -> new RuntimeException("Rôle 'administrateur' non trouvé"));
        roles.add(userRole);
        administrateur.setRole(Erole.ADMINISTRATEUR);
        administrateur.setEnabled(true);


        administrateur = administrateurRepository.save(administrateur);
        return AdministrateurDto.toDto(administrateur);
    }

    @Override
    public  AdministrateurDto getAdministrateurById(Long id) {
        Administrateur administrateur = administrateurRepository.findById(id).orElseThrow();
        return AdministrateurDto.toDto(administrateur);
    }

    @Override
    public List<AdministrateurDto> getAdministrateurs() {
        List<Administrateur> administrateurs = administrateurRepository.findAll();
        return administrateurs.stream().map(AdministrateurDto::toDto).toList();
    }

    @Override
    public void deleteAdministrateurById(Long id) {
        getAdministrateurById(id);
        administrateurRepository.deleteById(id);

    }

}
