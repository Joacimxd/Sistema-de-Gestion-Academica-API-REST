import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { Usuario, PaginatedResponse } from '../../shared/models/interfaces';
import { ErrorHandlerService } from '../../shared/utils/error-handler';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly API_URL = 'http://localhost:3000/api/usuarios';
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getUsuarios(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<PaginatedResponse<Usuario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<PaginatedResponse<Usuario>>(this.API_URL, { params })
      .pipe(
        tap((response) => this.usuariosSubject.next(response.data)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, usuario).pipe(
      tap(() => this.refreshUsuarios()),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${id}`, usuario).pipe(
      tap(() => this.refreshUsuarios()),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.refreshUsuarios()),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  private refreshUsuarios(): void {
    this.getUsuarios().subscribe();
  }
}
