package com.Services;

import com.dto.LessonDto;
import com.exeptions.LessonNotFoundException;

import java.util.List;

public interface LessonService {


    LessonDto addLesson(LessonDto lessonDto) throws LessonNotFoundException;

    LessonDto getLessonById(Long id) throws LessonNotFoundException ;

    List<LessonDto> getLessons();

    void deleteLessonById(Long id)  throws LessonNotFoundException;

    List<LessonDto> getLessonsByChapitreId(Long chapitreId) throws LessonNotFoundException;

}
