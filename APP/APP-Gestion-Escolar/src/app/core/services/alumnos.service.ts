import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Alumno, PaginatedResponse } from '../../shared/models/interfaces';
import { ErrorHandlerService } from '../../shared/utils/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AlumnosService {
  private readonly API_URL = 'http://localhost:3000/api/alumnos';
  private alumnosSubject = new BehaviorSubject<Alumno[]>([]);
  public alumnos$ = this.alumnosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getAlumnos(page = 1, limit = 10): Observable<PaginatedResponse<Alumno>> {
    return this.http.get<PaginatedResponse<Alumno>>(
      `${this.API_URL}?page=${page}&limit=${limit}`
    );
  }

  getAlumno(id: number): Observable<Alumno> {
    return this.http.get<Alumno>(`${this.API_URL}/${id}`);
  }

  createAlumno(alumno: Alumno): Observable<Alumno> {
    return this.http.post<Alumno>(this.API_URL, alumno);
  }

  updateAlumno(id: number, alumno: Alumno): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.API_URL}/${id}`, alumno);
  }

  deleteAlumno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
