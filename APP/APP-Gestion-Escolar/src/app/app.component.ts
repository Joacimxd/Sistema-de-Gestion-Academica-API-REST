import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { Usuario } from './shared/models/interfaces';

import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf
import { FormsModule } from '@angular/forms'; // Necesario para ngModel

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips'; // Parece que usas mat-chip

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app-container">
      <!-- Navbar - Solo se muestra si el usuario está autenticado -->
      <mat-toolbar color="primary" *ngIf="currentUser && !isLoginPage">
        <button mat-icon-button (click)="toggleSidenav()" *ngIf="isMobile">
          <mat-icon>menu</mat-icon>
        </button>

        <span class="app-title">
          <mat-icon>school</mat-icon>
          Sistema Académico
        </span>

        <span class="spacer"></span>

        <!-- Info del usuario -->
        <div class="user-info" *ngIf="currentUser">
          <mat-chip-set>
            <mat-chip [color]="getRoleColor(currentUser.rol)">
              {{ getRoleLabel(currentUser.rol) }}
            </mat-chip>
          </mat-chip-set>
          <span class="username">{{ currentUser.nombre }}</span>

          <!-- Menú de usuario -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="viewProfile()">
              <mat-icon>person</mat-icon>
              <span>Mi Perfil</span>
            </button>
            <button mat-menu-item (click)="changePassword()">
              <mat-icon>lock</mat-icon>
              <span>Cambiar Contraseña</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <!-- Contenedor principal con sidenav -->
      <mat-sidenav-container
        class="sidenav-container"
        *ngIf="currentUser && !isLoginPage"
      >
        <!-- Sidebar de navegación -->
        <mat-sidenav
          #sidenav
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile"
          class="app-sidenav"
        >
          <mat-nav-list>
            <!-- Navegación para Admin -->
            <ng-container *ngIf="currentUser.rol === 'admin'">
              <h3 mat-subheader>Administración</h3>

              <a
                mat-list-item
                routerLink="/admin/dashboard"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/usuarios"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Usuarios</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/alumnos"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>school</mat-icon>
                <span matListItemTitle>Alumnos</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/profesores"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>person</mat-icon>
                <span matListItemTitle>Profesores</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/materias"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>book</mat-icon>
                <span matListItemTitle>Materias</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/grupos"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>group</mat-icon>
                <span matListItemTitle>Grupos</span>
              </a>

              <a
                mat-list-item
                routerLink="/admin/inscripciones"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Inscripciones</span>
              </a>
            </ng-container>

            <!-- Navegación para Profesor -->
            <ng-container *ngIf="currentUser.rol === 'profesor'">
              <h3 mat-subheader>Profesor</h3>

              <a
                mat-list-item
                routerLink="/profesor/dashboard"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>

              <a
                mat-list-item
                routerLink="/profesor/grupos"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>group</mat-icon>
                <span matListItemTitle>Mis Grupos</span>
              </a>

              <a
                mat-list-item
                routerLink="/profesor/alumnos"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>school</mat-icon>
                <span matListItemTitle>Mis Alumnos</span>
              </a>

              <a
                mat-list-item
                routerLink="/profesor/calificaciones"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>grade</mat-icon>
                <span matListItemTitle>Calificaciones</span>
              </a>
            </ng-container>

            <!-- Navegación para Alumno -->
            <ng-container *ngIf="currentUser.rol === 'alumno'">
              <h3 mat-subheader>Alumno</h3>

              <a
                mat-list-item
                routerLink="/alumno/dashboard"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>

              <a
                mat-list-item
                routerLink="/alumno/inscripciones"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Mis Inscripciones</span>
              </a>

              <a
                mat-list-item
                routerLink="/alumno/calificaciones"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>grade</mat-icon>
                <span matListItemTitle>Calificaciones</span>
              </a>

              <a
                mat-list-item
                routerLink="/alumno/horarios"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>schedule</mat-icon>
                <span matListItemTitle>Horarios</span>
              </a>
            </ng-container>
          </mat-nav-list>
        </mat-sidenav>

        <!-- Contenido principal -->
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <!-- Para páginas sin navegación (como login) -->
      <div class="full-content" *ngIf="!currentUser || isLoginPage">
        <router-outlet></router-outlet>
      </div>

      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Cargando...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .app-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .username {
        font-size: 14px;
        margin-left: 8px;
      }

      .sidenav-container {
        flex: 1;
      }

      .app-sidenav {
        width: 250px;
        background: #fafafa;
      }

      .app-sidenav mat-nav-list {
        padding-top: 0;
      }

      .app-sidenav .mat-mdc-list-item.active {
        background-color: rgba(63, 81, 181, 0.1);
        color: #3f51b5;
      }

      .app-sidenav .mat-mdc-list-item.active .mat-icon {
        color: #3f51b5;
      }

      .main-content {
        display: flex;
        flex-direction: column;
      }

      .content-wrapper {
        flex: 1;
        padding: 20px;
        background-color: #f5f5f5;
        overflow-y: auto;
      }

      .full-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
      }

      .loading-overlay p {
        margin-top: 16px;
        font-size: 16px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .user-info .username {
          display: none;
        }

        .content-wrapper {
          padding: 16px;
        }

        .app-title {
          font-size: 16px;
        }
      }

      /* Animaciones */
      .mat-mdc-list-item {
        transition: all 0.2s ease-in-out;
      }

      .mat-mdc-list-item:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'sistema-academico';
  currentUser: Usuario | null = null;
  isLoginPage = false;
  isLoading = false;
  isMobile = false;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {
    // Detectar si es móvil
    this.checkIfMobile();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.checkIfMobile();
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    // Detectar cambios de ruta para saber si estamos en login
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url === '/login' || event.url === '/';
      });

    // Validar token al iniciar la aplicación
    this.validateInitialToken();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private validateInitialToken(): void {
    if (this.authService.isAuthenticated() && !this.isLoginPage) {
      this.isLoading = true;
      this.authService
        .validateToken()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (isValid) => {
            if (!isValid) {
              this.authService.logout();
              this.router.navigate(['/login']);
            }
            this.isLoading = false;
          },
          error: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
            this.isLoading = false;
          },
        });
    }
  }

  toggleSidenav(): void {
    // Esta función será llamada desde el template
    // El sidenav se maneja directamente en el template con #sidenav
  }

  getRoleColor(rol: string): string {
    switch (rol) {
      case 'admin':
        return 'primary';
      case 'profesor':
        return 'accent';
      case 'alumno':
        return 'warn';
      default:
        return '';
    }
  }

  getRoleLabel(rol: string): string {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'profesor':
        return 'Profesor';
      case 'alumno':
        return 'Alumno';
      default:
        return rol;
    }
  }

  viewProfile(): void {
    // Navegar al perfil del usuario
    this.router.navigate(['/profile']);
  }

  changePassword(): void {
    // Navegar a cambio de contraseña
    this.router.navigate(['/change-password']);
  }

  logout(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 1000);
  }
}
