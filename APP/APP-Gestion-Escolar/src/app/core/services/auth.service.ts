import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError } from 'rxjs';
import { Usuario, AuthResponse } from '../../shared/models/interfaces';
import { ErrorHandlerService } from '../../shared/utils/error-handler';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/profile`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) return new BehaviorSubject(false);

    return this.http.get<{ valid: boolean }>(`${this.API_URL}/validate`).pipe(
      map((response) => response.valid),
      catchError(() => new BehaviorSubject(false))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
}
