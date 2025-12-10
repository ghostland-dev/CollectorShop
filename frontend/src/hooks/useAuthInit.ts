import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth.service';

/**
 * Hook pour initialiser l'authentification au chargement de l'application
 * Récupère le profil utilisateur si on a un token mais pas d'utilisateur
 * Le refresh automatique est géré par l'intercepteur axios
 */
export function useAuthInit() {
  const { token, refreshToken, user, setAuth } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      if (token && !user && refreshToken) {
        try {
          const userData = await authService.getMe();
          setAuth(userData, token, refreshToken);
        } catch (error) {
          // Si le token est invalide, l'intercepteur essaiera de le renouveler
          // Si ça échoue, il déconnectera automatiquement
        }
      }
    };

    const timer = setTimeout(() => {
      initAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [token, refreshToken, user, setAuth]);

  return null;
}
