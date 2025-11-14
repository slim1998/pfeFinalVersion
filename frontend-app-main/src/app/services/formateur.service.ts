import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Formateur } from '../models/formateur';
import { Apprenant } from '../models/apprenant';

@Injectable({
  providedIn: 'root'
})
export class FormateurService {
 baseUrl = environment.baseUrl + "/formateur"
  baseUrl2 = environment.baseUrl + "/module"

  constructor(private http: HttpClient, private router: Router) { }
    getAllFormateurs() : Observable<Formateur[]>{
    return this.http.get<Formateur[]>(`${this.baseUrl}/getallformateurs`)

  }

  getFormateurByid( id : any) : Observable<Formateur>{
    return this.http.get<Formateur>(`${this.baseUrl}/getformateurbyid/${id}`)

  }

  addFormateur(Formateur : Formateur) : Observable<Formateur>{
    return this.http.post<Formateur>(`${this.baseUrl}/addformateur`,Formateur)

  }

deleteFormateur(id: any) {
  return this.http.delete(`${this.baseUrl}/deleteformateur/${id}`)
}

  updateFormateur(id: number, Formateur: Formateur): Observable<Formateur> {
    return this.http.put<Formateur>(`${this.baseUrl}/updateformateur/${id}`, Formateur);
  }


changePassword(userId: number, currentPassword: string, newPassword: string) {

  const params = new HttpParams()
    .set('currentPassword', currentPassword)
    .set('newPassword', newPassword);

  return this.http.put(`${this.baseUrl}/change-password/${userId}`, null, { params }
  );
}



updateEmail(userId: number, newEmail: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/update-email/${userId}`,null,
    { params: new HttpParams().set('newEmail', newEmail) }
  );
}



    uploadFormateurImage(idFormateur: number, image: File ): Observable<Formateur> {
            const formData: FormData = new FormData();
            formData.append('image', image);

            return this.http.post<Formateur>(`${environment.baseUrl}/formateur/uploadImage/${idFormateur}`, formData);
          }


getFormationCountByFormateur(formateurId: number): Observable<number> {
  return this.http
    .get<{ count: number }>(`${environment.baseUrl2}/countByFormateur/${formateurId}`)
    .pipe(map(res => res.count));
}

 getApprenantsByFormateur(formateurId: number): Observable<Apprenant[]> {
    return this.http.get<Apprenant[]>(`${this.baseUrl}/${formateurId}/apprenants`);
  }

}
