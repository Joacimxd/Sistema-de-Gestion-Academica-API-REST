import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, map } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.validateToken().pipe(
      map((isValid) => {
        if (!isValid) {
          this.router.navigate(["/login"]);
          return false;
        }

        const requiredRole = route.data?.["role"];
        if (requiredRole) {
          const userRole = this.authService.getCurrentUser()?.rol;
          if (userRole !== requiredRole && userRole !== "admin") {
            this.router.navigate(["/unauthorized"]);
            return false;
          }
        }

        return true;
      })
    );
  }
}
