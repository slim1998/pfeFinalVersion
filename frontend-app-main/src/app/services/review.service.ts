import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
baseUrl = environment.baseUrl + "/review";
  constructor(private http: HttpClient, private router: Router) { }


  addReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/addreview`, review);
  
  }

  /**
   * Récupérer un avis par ID
   */
  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/getreviewbyid/${id}`);
  }

  /**
   * Récupérer les avis d’un module
   */
  getReviewsByModule(moduleId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/module/${moduleId}`);
  }

  /**
   * Récupérer tous les avis
   */
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/getallreviews`);
  }

  /**
   * Supprimer un avis par ID
   */
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deletereview/${id}`);
  }

  /**
   * Mettre à jour un avis
   */
  updateReview(id: number, review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/updatereview/${id}`, review);
  }

  /**
   * Vérifier si un avis existe déjà
   */
  checkReviewExists(moduleId: number, apprenantId: number, formateurId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/exists?moduleId=${moduleId}&apprenantId=${apprenantId}&formateurId=${formateurId}`
    );
  }

}
