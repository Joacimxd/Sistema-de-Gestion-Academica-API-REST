import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { Profesor, PaginatedResponse } from "../../shared/models/interfaces";

@Injectable({ providedIn: "root" })
export class ProfesoresService {
  private readonly API_URL = "http://localhost:3000/api/profesores";
  private profesoresSubject = new BehaviorSubject<Profesor[]>([]);
  public profesores$ = this.profesoresSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProfesores(page = 1, limit = 10): Observable<PaginatedResponse<Profesor>> {
    return this.http.get<PaginatedResponse<Profesor>>(
      `${this.API_URL}?page=${page}&limit=${limit}`
    );
  }

  getProfesor(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.API_URL}/${id}`);
  }

  createProfesor(profesor: Profesor): Observable<Profesor> {
    return this.http.post<Profesor>(this.API_URL, profesor);
  }

  updateProfesor(id: number, profesor: Profesor): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.API_URL}/${id}`, profesor);
  }

  deleteProfesor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
