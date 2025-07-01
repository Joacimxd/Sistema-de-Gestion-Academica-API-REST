import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../shared/models/interfaces';

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
  selector: 'app-usuarios-form',
  standalone: true,
  template: `
    <h2 mat-dialog-title>
      {{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
    </h2>

    <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="form-content">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre completo</mat-label>
            <input
              matInput
              formControlName="nombre"
              placeholder="Ingrese el nombre"
            />
            <mat-error *ngIf="usuarioForm.get('nombre')?.hasError('required')">
              El nombre es requerido
            </mat-error>
            <mat-error *ngIf="usuarioForm.get('nombre')?.hasError('minlength')">
              El nombre debe tener al menos 3 caracteres
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input
              matInput
              formControlName="email"
              type="email"
              placeholder="usuario@ejemplo.com"
            />
            <mat-error *ngIf="usuarioForm.get('email')?.hasError('required')">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="usuarioForm.get('email')?.hasError('email')">
              Ingrese un email válido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="!isEdit">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              formControlName="password"
              [type]="hidePassword ? 'password' : 'text'"
              placeholder="Ingrese la contraseña"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hidePassword = !hidePassword"
            >
              <mat-icon>{{
                hidePassword ? 'visibility' : 'visibility_off'
              }}</mat-icon>
            </button>
            <mat-error
              *ngIf="usuarioForm.get('password')?.hasError('required')"
            >
              La contraseña es requerida
            </mat-error>
            <mat-error
              *ngIf="usuarioForm.get('password')?.hasError('minlength')"
            >
              La contraseña debe tener al menos 6 caracteres
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rol">
              <mat-option value="admin">Administrador</mat-option>
              <mat-option value="profesor">Profesor</mat-option>
              <mat-option value="alumno">Alumno</mat-option>
            </mat-select>
            <mat-error *ngIf="usuarioForm.get('rol')?.hasError('required')">
              Seleccione un rol
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-checkbox formControlName="activo"> Usuario activo </mat-checkbox>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button
          mat-button
          type="button"
          (click)="onCancel()"
          [disabled]="loading"
        >
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="usuarioForm.invalid || loading"
        >
          <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
          {{ isEdit ? 'Actualizar' : 'Crear' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-content {
        width: 100%;
        max-width: 500px;
      }
      .form-row {
        width: 100%;
        margin-bottom: 16px;
      }
      .full-width {
        width: 100%;
      }
      mat-dialog-actions {
        padding: 16px 0;
      }
    `,
  ],
})
export class UsuariosFormComponent implements OnInit, OnDestroy {
  usuarioForm: FormGroup;
  isEdit = false;
  loading = false;
  hidePassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<UsuariosFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null
  ) {
    this.isEdit = !!data?.id;
    this.usuarioForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadUsuarioData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const form: FormGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      activo: [true],
    });

    if (!this.isEdit) {
      form.addControl(
        'password',
        this.fb.control('', [Validators.required, Validators.minLength(6)])
      );
    }

    return form;
  }

  private loadUsuarioData(): void {
    if (this.data) {
      this.usuarioForm.patchValue({
        nombre: this.data.nombre,
        email: this.data.email,
        rol: this.data.rol,
        activo: this.data.activo,
      });
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      const formData = this.usuarioForm.value;

      const operation = this.isEdit
        ? this.usuariosService.updateUsuario(this.data!.id!, formData)
        : this.usuariosService.createUsuario(formData);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          const message = this.isEdit
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado correctamente';

          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
