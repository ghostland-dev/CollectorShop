import { useAuthStore } from '../stores/authStore';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined>;
  _retry?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: string) => void;
    reject: (error?: unknown) => void;
  }> = [];

  private async request<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { params, _retry, ...fetchConfig } = config;
    
    // Construire l'URL avec les paramètres de requête
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    // Ajouter le token JWT
    const token = useAuthStore.getState().token;
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(fetchConfig.headers as Record<string, string>),
    });
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(fullUrl, {
        ...fetchConfig,
        headers,
      });

      // Gérer les erreurs HTTP
      if (!response.ok) {
        if (response.status === 401 && !_retry) {
          return this.handle401Error(url, config) as Promise<ApiResponse<T>>;
        }
        
        const errorData = await this.parseErrorResponse(response);
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Gérer les erreurs réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          `Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le backend est démarré.`,
          0,
          { error: 'Network Error' }
        );
      }
      
      throw error;
    }
  }

  private async parseErrorResponse(response: Response): Promise<{ error?: string; message?: string }> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { error: response.statusText };
    } catch {
      return { error: response.statusText };
    }
  }

  private shouldHandle401Error(url: string): boolean {
    return !url.includes('/auth/login') && 
           !url.includes('/auth/refresh') && 
           !url.includes('/auth/register');
  }

  private async handle401Error(url: string, originalConfig: RequestConfig): Promise<ApiResponse<unknown>> {
    if (!this.shouldHandle401Error(url)) {
      useAuthStore.getState().logout();
      throw new ApiError('Non autorisé', 401, { error: 'Unauthorized' });
    }

    if (this.isRefreshing) {
      return this.queueRequest(url, originalConfig);
    }

    originalConfig._retry = true;
    this.isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      this.processQueue(null, new Error('Pas de refresh token'));
      throw new ApiError('Pas de refresh token', 401, { error: 'No refresh token' });
    }

    try {
      return await this.refreshAndRetry(url, originalConfig, refreshToken);
    } catch (refreshError) {
      this.processQueue(null, refreshError);
      useAuthStore.getState().logout();
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  private queueRequest(url: string, originalConfig: RequestConfig): Promise<ApiResponse<unknown>> {
    return new Promise<string>((resolve, reject) => {
      this.failedQueue.push({ 
        resolve: (value?: string) => resolve(value || ''), 
        reject 
      });
    })
      .then((token: string) => {
        return this.request(url, {
          ...originalConfig,
          headers: {
            ...originalConfig.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .catch((err) => Promise.reject(err));
  }

  private async refreshAndRetry(
    url: string,
    originalConfig: RequestConfig,
    refreshToken: string
  ): Promise<ApiResponse<unknown>> {
    const response = await authService.refreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken, user } = response;
    
    useAuthStore.getState().setTokens(accessToken, newRefreshToken);
    if (user) {
      useAuthStore.getState().setAuth(user, accessToken, newRefreshToken);
    }

    this.processQueue(accessToken, null);
    const headers = new Headers(originalConfig.headers as HeadersInit);
    headers.set('Authorization', `Bearer ${accessToken}`);
    return this.request(url, {
      ...originalConfig,
      headers,
    });
  }

  private processQueue(token: string | null, error: unknown): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token || undefined);
      }
    });
    this.failedQueue = [];
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: { error?: string; message?: string }
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get response() {
    return {
      status: this.status,
      data: this.data,
    };
  }
}

export const apiClient = new ApiClient();
