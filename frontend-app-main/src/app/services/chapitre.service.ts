import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Chapitre } from '../models/chapitre';

@Injectable({
  providedIn: 'root'
})
export class ChapitreService {

  
    baseUrl = environment.baseUrl + "/chapitre"

    constructor(private http: HttpClient, private router: Router) { }


    getAllChapitre(): Observable<Chapitre[]> {
      return this.http.get<Chapitre[]>(`${this.baseUrl}/getallchapitres`)

    }

    getChapitreByid(id: any): Observable<Chapitre> {
      return this.http.get<Chapitre>(`${this.baseUrl}/getchapitrebyid/${id}`)

    }

    addChapitre(chapitre: Chapitre): Observable<Chapitre> {
      return this.http.post<Chapitre>(`${this.baseUrl}/save`, chapitre)

    }

    deleteChapitre(id: any) {
      return this.http.delete(`${this.baseUrl}/deletechapitre/${id}`)

    }

    updateChapitre(id: number, chapitre: Chapitre): Observable<Chapitre> {
      return this.http.put<Chapitre>(`${this.baseUrl}/updatechapitre/${id}`, chapitre);
    }
      getChapitresByModuleId(moduleId: number): Observable<Chapitre[]> {
    return this.http.get<Chapitre[]>(`${this.baseUrl}/getchapitrebymodule/${moduleId}`);
  }

}
