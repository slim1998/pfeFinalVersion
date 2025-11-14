package com.Services;

import com.dto.ReviewDto;
import com.entities.Review;
import com.exeptions.ReviewNotFoundException;

import java.util.List;

public interface ReviewService {

    ReviewDto addReview(ReviewDto reviewDto) throws ReviewNotFoundException;
    ReviewDto getReviewById(Long id) throws ReviewNotFoundException;
    public List<ReviewDto> getReviews();
    void deleteReviewById(Long id) throws ReviewNotFoundException;
    ReviewDto updateReview(Long id, ReviewDto reviewDto) throws ReviewNotFoundException;

    List<ReviewDto> getReviewsByModuleId(Long moduleId);


 boolean checkReviewExists(Long moduleId, Long apprenantId);
}

