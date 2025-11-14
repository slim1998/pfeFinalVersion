package com.Services;

import com.dto.ChapitreDto;
import com.exeptions.ChapitreNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ChapitreService {


    ChapitreDto addChapitre(ChapitreDto chapitreDto) throws ChapitreNotFoundException;

    ChapitreDto getChapitreById(Long id) throws ChapitreNotFoundException;

    List<ChapitreDto> getChapitres();

    void deleteChapitreById(Long id) throws ChapitreNotFoundException;
    List<ChapitreDto> getChapitresByModuleId(Long moduleId) throws ChapitreNotFoundException;

}
