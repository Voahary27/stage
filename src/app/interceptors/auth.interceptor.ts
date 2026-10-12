import { HttpInterceptorFn } from '@angular/common/http';

//  ajoute le token d'authentification aux en-têtes des requêtes HTTP si le token est présent dans le stockage local.

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};