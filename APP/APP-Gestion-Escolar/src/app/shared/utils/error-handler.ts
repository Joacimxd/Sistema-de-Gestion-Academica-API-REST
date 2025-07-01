import { Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ha ocurrido un error inesperado";

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = "Solicitud incorrecta";
          break;
        case 401:
          errorMessage = "No autorizado";
          break;
        case 403:
          errorMessage = "Acceso denegado";
          break;
        case 404:
          errorMessage = "Recurso no encontrado";
          break;
        case 500:
          errorMessage = "Error interno del servidor";
          break;
        default:
          errorMessage = error.error?.message || errorMessage;
      }
    }

    this.snackBar.open(errorMessage, "Cerrar", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    });

    return throwError(() => error);
  }
}
