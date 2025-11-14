import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Certification } from '../models/certification';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
   baseUrl = environment.baseUrl + "/certifications"

    constructor(private http: HttpClient, private router: Router) { }


  // ➕ Ajouter une certification
  addCertification(cert: Certification): Observable<Certification> {
    return this.http.post<Certification>(`${this.baseUrl}/addcertification`,cert);
  }

  // 📋 Récupérer toutes les certifications
  getAllCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.baseUrl}/getallcertification`);
  }

  // 📌 Récupérer les certifications par module
  getCertificationsByModule(moduleId: number): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.baseUrl}/getcertificationbymodule/${moduleId}`);
  }

  // 👨‍🎓 Récupérer les certifications par apprenant
  getCertificationsByApprenant(apprenantId: number): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.baseUrl}/getcertificationbyapprenant/${apprenantId}`);
  }

getCertificationsByFormateur(formateurId: number): Observable<Certification[]> {
  return this.http.get<Certification[]>(`${this.baseUrl}/getcertificationbyformateur/${formateurId}`);
}


}
