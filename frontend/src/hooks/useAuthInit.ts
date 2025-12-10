import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';

/**
 * Hook pour initialiser l'authentification au chargement de l'application
 * Récupère le profil utilisateur si on a un token mais pas d'utilisateur
 * Le refresh automatique est géré par l'intercepteur axios
 */
export function useAuthInit() {
  const { token, refreshToken, user, setAuth, logout } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Éviter les appels multiples
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      // Si on a un token mais pas d'utilisateur, récupérer le profil
      // L'intercepteur axios gérera automatiquement le refresh si nécessaire
      if (token && !user && refreshToken) {
        try {
          const userData = await authService.getMe();
          setAuth(userData, token, refreshToken);
        } catch (error) {
          // Si le token est invalide, l'intercepteur essaiera de le renouveler
          // Si ça échoue, il déconnectera automatiquement
          // On ne fait rien ici pour éviter les appels multiples
        }
      }
    };

    // Délai pour éviter les appels trop tôt
    const timer = setTimeout(() => {
      initAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Seulement au montage du composant

  return null;
}
