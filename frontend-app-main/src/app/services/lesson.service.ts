import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Lesson } from '../models/lesson';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
 baseUrl = environment.baseUrl + "/lesson"

    constructor(private http: HttpClient, private router: Router) { }


    getAllLesson(): Observable<Lesson[]> {
      return this.http.get<Lesson[]>(`${this.baseUrl}/getalllessons`)

    }

    getLessonByid(id: any): Observable<Lesson> {
      return this.http.get<Lesson>(`${this.baseUrl}/getlessonbyid/${id}`)

    }

    addLesson(lesson: Lesson): Observable<Lesson> {
      return this.http.post<Lesson>(`${this.baseUrl}/addlesson`, lesson)

    }

    deleteLesson(id: any) {
      return this.http.delete(`${this.baseUrl}/deletelesson/${id}`)

    }

    updateLesson(id: number, lesson: Lesson): Observable<Lesson> {
      return this.http.put<Lesson>(`${this.baseUrl}/updatelesson/${id}`, lesson);
    }


      getLessonsByChapitre(chapitreId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseUrl}/getlessonsbychapitreid/${chapitreId}`);
  }
}
