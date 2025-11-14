import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Categorie } from '../models/categorie';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  baseUrl = environment.baseUrl + "/categorie"
  constructor(private http: HttpClient, private router: Router) { }

  getAllCategories(): Observable<Categorie[]> {

    return this.http.get<Categorie[]>(`${this.baseUrl}/getallCategorie`)

  }
  getCategorieByid(id: any): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.baseUrl}/getcategoriebyid/${id}`)
  }
  addCategorie(Categorie: any) : Observable<Categorie> {
    return this.http.post<Categorie>(`${this.baseUrl}/addcategorie`, Categorie)
  }
  deleteCategorie(id: any) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`)
  }
  updateCategorie(id: number, Categorie: any): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.baseUrl}/update/${id}`, Categorie);
  }
  // uploadCategorieImage(idCategorie: number, image: File): Observable<Categorie> {
  //   const formData: FormData = new FormData();
  //   formData.append('image', image);

  //   return this.http.post<Categorie>(`${this.baseUrl}/uploadImage/${idCategorie}`, formData);
 
  // }

// In your category.service.ts file, make sure the upload method is correct:

uploadCategorieImage(categorieId: number, formData: FormData): Observable<Categorie> {
  console.log('Service: uploading image for category', categorieId);
  
  // Make sure the URL matches your backend endpoint
  const uploadUrl = `${this.baseUrl}/uploadImage/${categorieId}`;
  
  // Important: Don't set Content-Type header manually when sending FormData
  // Angular will set it automatically with the boundary
  const httpOptions = {
    // Don't set headers for FormData - let Angular handle it
  };
  
  return this.http.post<Categorie>(uploadUrl, formData, httpOptions).pipe(
    tap(response => console.log('Service: upload response', response)),
    catchError((error: any) => {
      console.error('Service: upload error', error);
      throw error;
    })
  );
}

}
