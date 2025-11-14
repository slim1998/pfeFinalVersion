import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, of, forkJoin, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Module } from '../models/module';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  baseUrl = environment.baseUrl + "/module"
   baseUrl1 = environment.baseUrl + "/demandeachat"

    constructor(private http: HttpClient, private router: Router) { }


  // 1. Ajouter une formation
  addModule(module: Module): Observable<Module> {
    return this.http.post<Module>(`${this.baseUrl}/addmodule`, module);
  }

  // 2. Upload image
  uploadModuleImage(id: number, image: File): Observable<Module> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<Module>(`${this.baseUrl}/uploadImage/${id}`, formData);
  }

  // 3. Update video
 // 1. Upload vidéo
uploadModuleVideo(id: number, file: File) {
  const formData = new FormData();
  formData.append('video', file); // ⚠️ doit correspondre à @RequestParam("video")
  return this.http.post<Module>(`${this.baseUrl}/uploadvideo/${id}`, formData);
}



createModuleFull(module: Module, imageFile?: File, videoFile?: File): Observable<Module> {
  return this.addModule(module).pipe(
    switchMap((createdModule) => {
      const id = createdModule.id;

      if (!id) return of(createdModule);

      const ops: Observable<Module>[] = [];

      if (imageFile) {
        ops.push(this.uploadModuleImage(id, imageFile));
      }

      if (videoFile) {
        ops.push(this.uploadModuleVideo(id, videoFile));
      }

      if (ops.length === 0) return of(createdModule);

      // Exécuter tous les uploads en parallèle et fusionner les résultats
      return forkJoin(ops).pipe(
        map((results) => {
          let mergedModule = { ...createdModule };
          results.forEach(res => {
            mergedModule = { ...mergedModule, ...res };
          });
          return mergedModule;
        })
      );
    })
  );
}



    getAllModule(): Observable<Module[]> {
      return this.http.get<Module[]>(`${this.baseUrl}/getallmodules`)

    }

    getModuleByid(id: any): Observable<Module> {
      return this.http.get<Module>(`${this.baseUrl}/getmodulebyid/${id}`)

    }

 updateModuleFull(id: number, module: Module, imageFile?: File, videoFile?: File): Observable<Module> {
    // D'abord, on met à jour les données du module (y compris chapitres et lessons)
    return this.updateModule(id, module).pipe(
      switchMap((updatedModule) => {
        const ops: Observable<Module>[] = [];


        // Si on a une nouvelle image, on l'upload
        if (imageFile) {
          ops.push(this.uploadModuleImage(id, imageFile));
        }


        // Si on a une nouvelle vidéo, on l'upload
        if (videoFile) {
          ops.push(this.uploadModuleVideo(id, videoFile));
        }


        // Si pas de fichiers à uploader, on retourne directement le module mis à jour
        if (ops.length === 0) return of(updatedModule);


        // Sinon, on exécute tous les uploads en parallèle
        return forkJoin(ops).pipe(
          map((results) => {
            let mergedModule = { ...updatedModule };
            results.forEach(res => {
              mergedModule = { ...mergedModule, ...res };
            });
            return mergedModule;
          })
        );
      })
    );
  }





    deleteModule(id: any) {
      return this.http.delete(`${this.baseUrl}/delete/${id}`)

    }

    updateModule(id: number, module: Module): Observable<Module> {
      return this.http.put<Module>(`${this.baseUrl}/updatemodule/${id}`, module);
    }




            getModulesByFormateur(formateurId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/getModuleByFormateur/${formateurId}`);
  }




    getAcceptedModules(apprenantId: number): Observable<Module[]> {

    return this.http.get<Module[]>(`${this.baseUrl}/formationachetes/${apprenantId}`);
  }








   getModuleOverview(moduleId: number): Observable<Module> {
    return this.http.get<Module>(`${this.baseUrl1}/${moduleId}/overview`);
  }

  // Optionnel : méthode pour envoyer la demande d'achat
  requestPurchase(moduleId: number): Observable<any> {
    return this.http.post(`${this.baseUrl1}/${moduleId}/demande-achat`, {});
  }
}