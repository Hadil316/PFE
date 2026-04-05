import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// OPTION 1: Utiliser une fonction (recommandé pour Angular 15+)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  
  if (token && !req.url.includes('/auth/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  return next(req);
};

// OPTION 2: Garder la classe (si vous préférez)
// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private authService = inject(AuthService);
//
//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     const token = this.authService.getToken();
//
//     if (token && !request.url.includes('/auth/')) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//     }
//
//     return next.handle(request);
//   }
// }