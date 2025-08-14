import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/firebase/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
    private authService = inject(AuthService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.checkRoles(route);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.checkRoles(route);
    }

    private checkRoles(route: ActivatedRouteSnapshot): Observable<boolean> {
        const requiredRoles = route.data['roles'] as string[];
        const requiredPermissions = route.data['permissions'] as string[];

        return this.authService.currentUser$.pipe(
            map(user => {
                if (!user) {
                    this.router.navigate(['/sign-in']);
                    return false;
                }

                // Check roles if specified
                if (requiredRoles && requiredRoles.length > 0) {
                    const userRole = user.role || 'user';
                    const hasRole = requiredRoles.includes(userRole);
                    
                    if (!hasRole) {
                        this.router.navigate(['/unauthorized']);
                        return false;
                    }
                }

                // Check permissions if specified (future implementation)
                if (requiredPermissions && requiredPermissions.length > 0) {
                    // This would require implementing a permissions system
                    // For now, admin role has all permissions
                    if (user.role !== 'admin') {
                        this.router.navigate(['/unauthorized']);
                        return false;
                    }
                }

                return true;
            })
        );
    }
}