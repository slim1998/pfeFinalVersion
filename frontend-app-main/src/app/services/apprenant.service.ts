import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apprenant } from '../models/apprenant';
import { AuthenticationRequest } from '../models/authenticationrequest';
import { AutentificationResponse } from '../models/autentification-response';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class ApprenantService {

  //   @PostMapping("/registerApprenant")
  // public ResponseEntity<Response> registerapprenant(
  //         @RequestBody @Valid ApprenantDto userRequest,
  //         HttpServletRequest request
  // )  {
  //   return service.register(userRequest,request);
  // }

    baseUrl = environment.baseUrl + "/apprenant"
    baseUrl2 = environment.baseUrl + "/auth"
  constructor(private http: HttpClient, private router: Router) { }
  private authStatusSubject = new BehaviorSubject<boolean>(this.isUserAuthenticatedtest());
  public authStatus$ = this.authStatusSubject.asObservable();
 RegisterApprenant(Apprenant: Apprenant): Observable<Apprenant> {
    return this.http.post<Apprenant>(`${this.baseUrl2}/registerApprenant`, Apprenant)

  }
getAllApprenants(): Observable<Apprenant[]> {
    return this.http.get<Apprenant[]>(`${this.baseUrl}/getallapprenant`)

  }

  getApprenantByid(id: any): Observable<Apprenant> {
    return this.http.get<Apprenant>(`${this.baseUrl}/getapprenantbyid/${id}`)

  }

 

  deleteApprenant(id: any) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`)

  }

  updateApprenant(id: number, instructor: Apprenant): Observable<Apprenant> {
    return this.http.put<Apprenant>(`${this.baseUrl}/updateapprenant/${id}`, instructor);
  }

  changePassword(userId: number, currentPassword: string, newPassword: string) {
  const token = localStorage.getItem('accessToken');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const params = new HttpParams()
    .set('currentPassword', currentPassword)
    .set('newPassword', newPassword);

  return this.http.put(`${this.baseUrl}/change-password/${userId}`, null, {
    headers,
    params
  });
}


updateEmail(userId: number, newEmail: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/update-email/${userId}`,null,
    { params: new HttpParams().set('newEmail', newEmail) }
  );
}




  uploadApprenantImage(idApprenant: number, image: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', image); 
  return this.http.post(`${this.baseUrl}/uploadImage/${idApprenant}`, formData);
}

  login(authenticationrequest:AuthenticationRequest): Observable<AutentificationResponse> {
    return this.http.post<AutentificationResponse>(`${this.baseUrl2}/authenticate`,authenticationrequest);
  }


    setUserToken (authenticationResponse: AutentificationResponse){

 localStorage.setItem("accessToken", authenticationResponse.accessToken);
  const token = authenticationResponse.accessToken;


  if (token) {

  const decodedToken = jwtDecode(token) as any;
  const fullname = decodedToken.fullname;
  localStorage.setItem("fullName", fullname);

  const idUser = decodedToken.userId;
  localStorage.setItem("userId", idUser);

  const authorities = decodedToken.authorities[0].authority;
  console.log(decodedToken.authorities[0].authority);
  localStorage.setItem("role",authorities)

  console.log("okk",decodedToken)
    }

}

 // Nouvelle méthode pour changer le statut d'un apprenant
  // toggleApprenantStatus(id: number, status: boolean): Observable<any> {
  //   const params = new HttpParams().set('status', status.toString());
  //   return this.http.put(`${this.baseUrl}/toggleStatus/${id}`, null, { params });
  // }

toggleApprenantStatus(id: number, status: boolean): Observable<Apprenant> {
  return this.http.put<Apprenant>(`${this.baseUrl}/toggleStatus/${id}?status=${status}`, {});
}





  // Méthode pour obtenir les apprenants actifs seulement
  getActiveApprenants(): Observable<Apprenant[]> {
    return this.http.get<Apprenant[]>(`${this.baseUrl}/getActiveApprenants`)
  }

  // Méthode pour obtenir les apprenants inactifs seulement
  getInactiveApprenants(): Observable<Apprenant[]> {
    return this.http.get<Apprenant[]>(`${this.baseUrl}/getInactiveApprenants`)
  }

  // Méthodes existantes pour les statistiques
  getApprenantsStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`)
  }

 getRole() : string | null{
    return localStorage.getItem ("role")


  }
 isUserAuthenticatedtest(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Méthode à appeler après login
  setAuthenticated(value: boolean): void {
    this.authStatusSubject.next(value);
  }

  // Méthode de logout
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userEmail');
    this.authStatusSubject.next(false);
  }



}



