package com.Services.Impl;

import com.Services.LessonService;
import com.dto.LessonDto;
import com.dto.ModuleDto;
import com.entities.Lesson;
import com.exeptions.LessonNotFoundException;
import com.exeptions.ModuleNotFoundException;
import com.repositories.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {


    private final LessonRepository lessonRepository;

   @Override
    public LessonDto addLesson(LessonDto lessonDto) {
        Lesson lesson = LessonDto.toEntity(lessonDto);
        lesson = lessonRepository.save(lesson);
        return LessonDto.toDto(lesson);
    }

    @Override
    public LessonDto getLessonById(Long id) throws LessonNotFoundException {
        return lessonRepository.findById(id)
                .map(LessonDto::toDto)
                .orElseThrow(() -> new LessonNotFoundException("Lesson avec id " + id + " introuvable"));
    }

    @Override
    public List<LessonDto> getLessons() {
        return lessonRepository.findAll()
                .stream()
                .map(LessonDto::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteLessonById(Long id) throws LessonNotFoundException {
        if (!lessonRepository.existsById(id)) {
            throw new LessonNotFoundException("Lesson avec id " + id + " introuvable");
        }
        lessonRepository.deleteById(id);
    }


    @Override
    public List<LessonDto> getLessonsByChapitreId(Long chapitreId) {
        List<Lesson> lessons = lessonRepository.findByChapitreId(chapitreId);

        return lessons.stream()
                .map(LessonDto::toDto)
                .collect(Collectors.toList());
    }



}
