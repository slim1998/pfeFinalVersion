import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { QuizDto, QuizResponseDto } from '../models/quiz';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  baseUrl = environment.baseUrl + "/quizzes";

  constructor(private http: HttpClient, private router: Router) { }

  createQuizForChapitre(chapitreId: number, dto: QuizDto): Observable<any> {
    const url = `${this.baseUrl}/addquiztochapitre/${chapitreId}`;
    console.log('=== QUIZ SERVICE DEBUG ===');
    console.log('Base URL:', this.baseUrl);
    console.log('Chapter ID:', chapitreId);
    console.log('Full URL:', url);
    console.log('Quiz data:', dto);

    return this.http
      .post(url, dto)
      .pipe(
        tap(response => {
          console.log('Success response:', response);
        }),
        catchError(error => {
          console.error('Service error details:', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error url:', error.url);
          return this.handleError(error);
        })
      );
  }

  createFinalQuizForModule(moduleId: number, dto: QuizDto): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/addquiztomodule/${moduleId}`, dto)
      .pipe(catchError(this.handleError));
  }

  create(moduleId: number, dto: QuizDto): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/${moduleId}/addquiz`, dto)
      .pipe(catchError(this.handleError));
  }

  getquizbymoduleid(moduleId: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/${moduleId}/getquizbymoduleId`)
      .pipe(catchError(this.handleError));
  }



  getByIdWithModule(moduleId: number, quizId: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/${moduleId}/getquizbyid/${quizId}`)
      .pipe(catchError(this.handleError));
  }

  getById(quizId: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/getquizbyid/${quizId}`)
      .pipe(catchError(this.handleError));
  }

  update(moduleId: number, quizId: number, dto: QuizDto): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/${moduleId}/updatequiz/${quizId}`, dto)
      .pipe(catchError(this.handleError));
  }

  delete(moduleId: number, quizId: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/${moduleId}/deletequiz/${quizId}`)
      .pipe(catchError(this.handleError));
  }

  // Méthodes pour les quiz de chapitres
getQuizzeByChapitreId(chapitreId: number): Observable<QuizResponseDto[]> {
  const url = `${this.baseUrl}/getquizbychapitreid/${chapitreId}`;
  return this.http.get<QuizResponseDto>(url).pipe(
    map(response => response ? [response] : []), // Transformer objet en tableau
    catchError(() => of([])) // En cas d'erreur → tableau vide
  );
}


   updateQuizForChapitre(chapitreId: number, quizId: number, quiz: QuizDto): Observable<QuizResponseDto> {
    const url = `${this.baseUrl}/chapitre/${chapitreId}/updatequiz/${quizId}`;
    return this.http.put<QuizResponseDto>(url, quiz).pipe(
      catchError(this.handleError)
    );
  }

  deleteQuizForChapitre(chapitreId: number, quizId: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/chapitre/${chapitreId}/quiz/${quizId}`)
      .pipe(catchError(this.handleError));
  }

  getQuizByChapitreAndId(chapitreId: number, quizId: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/chapitre/${chapitreId}/quiz/${quizId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: any) {
    console.error('QuizService error details:', err);
    console.error('Error response body:', err.error);

    let errorMessage = 'Erreur serveur';

    if (err.error) {
      if (typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err.error.message) {
        errorMessage = err.error.message;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    console.error('Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }


}
