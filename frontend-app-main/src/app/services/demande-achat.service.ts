import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { DemandeAchat } from '../models/demande-achat';

@Injectable({
  providedIn: 'root'
})
export class DemandeAchatService {


  
    baseUrl = environment.baseUrl + "/demandeachat"

    constructor(private http: HttpClient, private router: Router) { }
 getAllDemandeAchat(): Observable<DemandeAchat[]> {
      return this.http.get<DemandeAchat[]>(`${this.baseUrl}/getallDemande`)

    }

    getDemandeAchatByid(id: any): Observable<DemandeAchat> {
      return this.http.get<DemandeAchat>(`${this.baseUrl}/getdemandebyid/${id}`)

    }

    addDemandeAchat(DemandeAchat: DemandeAchat): Observable<DemandeAchat> {
      return this.http.post<DemandeAchat>(`${this.baseUrl}/addDemande`, DemandeAchat)

    }

    deleteDemandeAchat(id: any) {
      return this.http.delete(`${this.baseUrl}/delete/${id}`)

    }

updateDemandeStatut(id: number, statut: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateStatut/${id}?statut=${statut}`, null);
}

}
