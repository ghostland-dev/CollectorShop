import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs et le refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Si erreur 401 et ce n'est pas une requête de refresh/login/register
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/register')
          ) {
            // Ne pas essayer de refresh pour les routes d'auth
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // Si un refresh est en cours, mettre en queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = useAuthStore.getState().refreshToken;

          if (!refreshToken) {
            useAuthStore.getState().logout();
            this.processQueue(null, new Error('Pas de refresh token'));
            return Promise.reject(error);
          }

          try {
            const response = await authService.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken, user } = response;
            
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);
            if (user) {
              useAuthStore.getState().setAuth(user, accessToken, newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            this.processQueue(accessToken, null);

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(null, refreshError);
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Améliorer le message d'erreur
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          error.message = `Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le backend est démarré.`;
        } else if (error.response?.data) {
          const errorData = error.response.data as any;
          error.message = errorData.error || errorData.message || error.message;
        }
        
        return Promise.reject(error);
      }
    );
  }

  private processQueue(token: string | null, error: any) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;
