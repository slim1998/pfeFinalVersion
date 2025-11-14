package com.Services;

import com.dto.CategorieDto;
import com.dto.FormateurDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategorieService {

    CategorieDto addCategorie(CategorieDto categorieDto);

    CategorieDto updateCategorie(Long id, CategorieDto dto);

    CategorieDto getCategorieById(Long id);

    public List<CategorieDto> getCategories();

    CategorieDto uploadCategorieImage(Long IdCategorie, MultipartFile image) ;

    void deleteCategirieById(Long id);
}
