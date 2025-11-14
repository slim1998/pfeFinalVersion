package com.Services;

import com.dto.CategorieDto;
import com.dto.ModuleDto;
import com.entities.Module;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ModuleService {


    ModuleDto addModule(ModuleDto moduleDto)  ;

    ModuleDto getModuleById(Long id) ;

    public List<ModuleDto> getModules();

    void deleteModuleById(Long id) ;

    ModuleDto updateModule(Long id, ModuleDto dto);

    ModuleDto uploadModuleImage(Long IdModule, MultipartFile image);


    ModuleDto uploadModuleVideo(Long idModule, MultipartFile video);

    List<ModuleDto> getModulesByFormateurId(Long formateurId);
     List<ModuleDto> getModulesByCategorieId(Long categorieId);

    Long getNombreFormationsByFormateur(Long formateurId);

}
