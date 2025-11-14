package com.controllers;

import com.Services.ReviewService;
import com.dto.ReviewDto;
import com.exeptions.ReviewNotFoundException;
import com.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/v1/review")
@RequiredArgsConstructor
@Log

public class ReviewController {


    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;


    @PostMapping("/addreview")
    public ResponseEntity<ReviewDto> addReview(@RequestBody final ReviewDto reviewDto) {
        try {
            return new ResponseEntity<>(reviewService.addReview(reviewDto), HttpStatus.CREATED);
        } catch (ReviewNotFoundException e) {
            log.info(String.format("review with id = %s not found", reviewDto.getId()));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getreviewbyid/{id}")
    public ResponseEntity<ReviewDto> getReviewById(@PathVariable("id") final Long id) {
        try {
            return new ResponseEntity<>(reviewService.getReviewById(id), HttpStatus.OK);
        } catch (ReviewNotFoundException e) {
            log.info(String.format("Review with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByModuleId(@PathVariable Long moduleId) {
        List<ReviewDto> reviews = reviewService.getReviewsByModuleId(moduleId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/getallreviews")
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return new ResponseEntity<>(reviewService.getReviews(), HttpStatus.OK);
    }
    @DeleteMapping("/deletereview/{id}")
    public ResponseEntity<Void> deleteReviewById(@PathVariable("id") final Long id) {
        try {
            reviewService.deleteReviewById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (ReviewNotFoundException e) {
            log.info(String.format("review with id = %s not found", id));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }



    @PutMapping("/updatereview/{id}")
    public ResponseEntity<ReviewDto> updateReview(@PathVariable Long id, @RequestBody ReviewDto reviewDto) {
        try {
            ReviewDto updatedReview = reviewService.updateReview(id, reviewDto);
            return ResponseEntity.ok(updatedReview);
        } catch (ReviewNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/exists")
    public boolean checkReview(@RequestParam Long moduleId,
                               @RequestParam Long apprenantId) {
        return reviewService.checkReviewExists(moduleId, apprenantId);
    }
}
