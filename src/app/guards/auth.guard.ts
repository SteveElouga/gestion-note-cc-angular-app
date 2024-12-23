import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {jwtDecode} from 'jwt-decode'; // Importez jwt-decode pour décoder le token

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  // Récupère le token dans les cookies
  const token = cookieService.get('access_token');

  if (token) {
    // Vérifie si le token est expiré
    if (isTokenExpired(token)) {
      // Si expiré, supprime le token et redirige
      cookieService.delete('access_token');
      router.navigate(['']); // Redirige vers la page d'accueil
      return false;
    }
    return true; // Le token est valide, autorise l'accès
  } else {
    // Si le token est absent, redirige vers la page d'accueil
    router.navigate(['']);
    return false;
  }
};

// Fonction pour vérifier l'expiration du token
function isTokenExpired(token: string): boolean {
  try {
    const decodedToken: { exp: number } = jwtDecode<{ exp: number }>(token);
    // Décode le token
    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
    return decodedToken.exp < currentTime; // Vérifie si la date d'expiration est passée
  } catch (error) {
    console.error('Erreur lors de la vérification du token :', error);
    return true; // Considère le token comme expiré en cas d'erreur
  }
}

;


