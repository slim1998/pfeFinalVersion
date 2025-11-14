package com.Services.Impl;

import com.Services.ReviewService;
import com.dto.LessonDto;
import com.dto.ReviewDto;
import com.entities.Lesson;
import com.entities.Review;
import com.exeptions.ReviewNotFoundException;
import com.repositories.ApprenantRepository;
import com.repositories.ModuleRepository;
import com.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {



        private final ReviewRepository reviewRepository;
        private final ApprenantRepository apprenantRepository;
        private final ModuleRepository moduleRepository;

    @Override
    public ReviewDto addReview(ReviewDto reviewDto) throws ReviewNotFoundException {
        // Vérifier si une review existe déjà
        if (reviewRepository.existsByModuleAndApprenant(reviewDto.getModuleId(), reviewDto.getApprenantId())) {
            throw new ReviewNotFoundException("Cet apprenant a déjà laissé un avis pour ce module.");
        }

        Review review = ReviewDto.toEntity(reviewDto);
        review.setDate(LocalDateTime.now()); // tu forces la date actuelle

        review = reviewRepository.save(review);
        return ReviewDto.toDto(review);
    }

        @Override
        public List<ReviewDto> getReviews() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream().map(ReviewDto::toDto).toList();
    }

        @Override
        public void deleteReviewById(Long id) throws ReviewNotFoundException {
        getReviewById(id);
        reviewRepository.deleteById(id);
    }

        @Override
        public ReviewDto getReviewById(Long id) throws ReviewNotFoundException {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("Review non trouvée avec l'ID : " + id));
        return ReviewDto.toDto(review);
    }

        @Override
        public ReviewDto updateReview(Long id, ReviewDto reviewDto) throws ReviewNotFoundException {
        Review existingReview = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("Review non trouvé avec l'ID : " + id));

        existingReview.setCommentaire(reviewDto.getCommentaire());
        existingReview.setDate(LocalDateTime.now());
        existingReview.setRating(reviewDto.getRating());
        existingReview.setVisible(reviewDto.isVisible());
        Review updatedReview = reviewRepository.save(existingReview);
        return ReviewDto.toDto(updatedReview);
    }
        @Override
        public List<ReviewDto> getReviewsByModuleId(Long moduleId) {
        List<Review> reviews = reviewRepository.findReviewsByModuleId(moduleId);
        return reviews.stream()
                .map(ReviewDto::toDto)
                .collect(Collectors.toList());
    }
        @Override

        public boolean checkReviewExists(Long moduleId, Long apprenantId) {
            return reviewRepository.existsByModuleAndApprenant(moduleId, apprenantId);
        }


}
