import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {ServiceService} from "../services/service.service";

export const intercepInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const service = inject(ServiceService);
  const router = inject(Router);

  // Récupérer le token depuis les cookies
  const token = cookieService.get('access_token');

  // Fonction pour gérer les erreurs communes
  const handleUnauthorized = (error: any) => {
    console.warn('Unauthorized: Redirecting to home');
    cookieService.delete('access_token');
    cookieService.delete('refresh_token'); // Supprimer les tokens invalides
    service.setLoader(false); // Désactiver le loader
    service.setSmallErrorMsg(true); // Afficher un message d'erreur
    router.navigate(['']); // Rediriger vers la page d'accueil
  };

  // Si la requête est pour le login, ne pas ajouter l'en-tête Authorization
  if (req.url.includes('/login')) {
    return next(req).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 400) {
          handleUnauthorized(error);
        }
        return throwError(() => error); // Propager l'erreur pour un traitement ultérieur
      })
    );
  }

  // Cloner la requête pour ajouter l'en-tête Authorization si un token existe
  const clonedRequest = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // Ajout du token dans l'en-tête
      },
    })
    : req;

  // Passer la requête clonée et gérer les erreurs
  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 400) {
        handleUnauthorized(error);
      } else if (error.status === 403) {
        console.warn('Forbidden: Access denied');
        // Gérer les accès interdits (403), si nécessaire
      } else if (req.url.includes('/notes') && error.status === 404) {
        console.warn('Not Found: Resource does not exist');
        // Vous pouvez rediriger ou traiter les erreurs 404 ici
        // router.navigateByUrl('dashboard');
      }
      return throwError(() => error); // Propager l'erreur pour un traitement ultérieur
    })
  );
};
