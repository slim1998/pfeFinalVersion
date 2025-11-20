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
  baseUrl = environment.baseUrl + "/module";
  baseUrl1 = environment.baseUrl + "/demandeachat";

  constructor(private http: HttpClient, private router: Router) { }

  // 1. Add a module
  addModule(module: Module): Observable<Module> {
    return this.http.post<Module>(`${this.baseUrl}/addmodule`, module);
  }

  // 2. Upload image
  uploadModuleImage(id: number, image: File): Observable<Module> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<Module>(`${this.baseUrl}/uploadImage/${id}`, formData);
  }

  // 3. Upload video
  uploadModuleVideo(id: number, file: File): Observable<Module> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http.post<Module>(`${this.baseUrl}/uploadvideo/${id}`, formData);
  }

  // 4. Create module with image and video
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

  // 5. Get all modules
  getAllModule(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/getallmodules`);
  }

  // 6. Get module by ID
  getModuleByid(id: number): Observable<Module> {
    return this.http.get<Module>(`${this.baseUrl}/getmodulebyid/${id}`);
  }

  // 7. Update module with image and video
  updateModuleFull(id: number, module: Module, imageFile?: File, videoFile?: File): Observable<Module> {
    return this.updateModule(id, module).pipe(
      switchMap((updatedModule) => {
        const ops: Observable<Module>[] = [];

        if (imageFile) {
          ops.push(this.uploadModuleImage(id, imageFile));
        }

        if (videoFile) {
          ops.push(this.uploadModuleVideo(id, videoFile));
        }

        if (ops.length === 0) return of(updatedModule);

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

  // 8. Update module (without image/video)
  updateModule(id: number, module: Module): Observable<Module> {
    return this.http.put<Module>(`${this.baseUrl}/updatemodule/${id}`, module);
  }

  // 9. Delete module - ✅ FIXED VERSION
  deleteModule(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  // 10. Get modules by formateur
  getModulesByFormateur(formateurId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/getModuleByFormateur/${formateurId}`);
  }

  // 11. Get accepted modules (purchased by apprenant)
  getAcceptedModules(apprenantId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/formationachetes/${apprenantId}`);
  }

  // 12. Get module overview
  getModuleOverview(moduleId: number): Observable<Module> {
    return this.http.get<Module>(`${this.baseUrl1}/${moduleId}/overview`);
  }

  // 13. Request purchase
  requestPurchase(moduleId: number): Observable<any> {
    return this.http.post(`${this.baseUrl1}/${moduleId}/demande-achat`, {});
  }
}