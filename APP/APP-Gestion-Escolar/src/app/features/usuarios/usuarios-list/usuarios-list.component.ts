import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario, PaginatedResponse } from '../../../shared/models/interfaces';
import { UsuariosFormComponent } from '../usuarios-form/usuarios-form.component';

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
  selector: 'app-usuarios-list',
  standalone: true,
  template: `
    <div class="usuarios-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Gestión de Usuarios</mat-card-title>
          <div class="header-actions">
            <mat-form-field appearance="outline">
              <mat-label>Buscar usuarios</mat-label>
              <input
                matInput
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
                placeholder="Nombre o email"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="openForm()">
              <mat-icon>add</mat-icon>
              Nuevo Usuario
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingTemplate">
            <table mat-table [dataSource]="usuarios" class="mat-elevation-z2">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let usuario">{{ usuario.id }}</td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let usuario">{{ usuario.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let usuario">{{ usuario.email }}</td>
              </ng-container>

              <ng-container matColumnDef="rol">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let usuario">
                  <mat-chip [color]="getRoleColor(usuario.rol)">
                    {{ usuario.rol }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="activo">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let usuario">
                  <mat-icon [color]="usuario.activo ? 'primary' : 'warn'">
                    {{ usuario.activo ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let usuario">
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="editUsuario(usuario)"
                    matTooltip="Editar"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteUsuario(usuario)"
                    matTooltip="Eliminar"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <mat-paginator
              [length]="totalItems"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageIndex]="currentPage - 1"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Cargando usuarios...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .usuarios-container {
        padding: 20px;
      }
      .header-actions {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-left: auto;
      }
      .table-container {
        width: 100%;
      }
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class UsuariosListComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  displayedColumns: string[] = [
    'id',
    'nombre',
    'email',
    'rol',
    'activo',
    'acciones',
  ];

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  // Búsqueda
  searchTerm = '';
  private searchSubject = new Subject<string>();

  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private usuariosService: UsuariosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsuarios();
      });
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuariosService
      .getUsuarios(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Usuario>) => {
          this.usuarios = response.data;
          this.totalItems = response.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsuarios();
  }

  openForm(usuario?: Usuario): void {
    const dialogRef = this.dialog.open(UsuariosFormComponent, {
      width: '600px',
      data: usuario || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsuarios();
      }
    });
  }

  editUsuario(usuario: Usuario): void {
    this.openForm(usuario);
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.usuariosService
        .deleteUsuario(usuario.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadUsuarios();
          },
        });
    }
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
}
