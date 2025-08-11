/**
 * Enhanced API Client with loading states, error handling, and performance monitoring
 */

import { trackApiResponse } from './performance-monitor';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  public status: number;
  public response: Response;
  public data: any;

  constructor(message: string, status: number, response: Response, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultOptions: ApiRequestOptions;
  private activeRequests = new Map<string, AbortController>();

  constructor(baseUrl: string = '', options: ApiRequestOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const requestId = `${options.method || 'GET'}-${url}`;
    const startTime = performance.now();

    // Abort previous request to same endpoint if still pending
    if (this.activeRequests.has(requestId)) {
      this.activeRequests.get(requestId)?.abort();
    }

    const abortController = new AbortController();
    this.activeRequests.set(requestId, abortController);

    const mergedOptions: RequestInit = {
      ...this.defaultOptions,
      ...options,
      signal: abortController.signal,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await this.fetchWithTimeout(url, mergedOptions, options.timeout);
      const duration = performance.now() - startTime;
      
      // Track API performance
      trackApiResponse(endpoint, duration, response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          response,
          errorData
        );
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }

      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          details: error.data
        };
      }

      // Network or other errors
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 30000
  ): Promise<Response> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    return Promise.race([
      fetch(url, options),
      timeoutPromise
    ]);
  }

  private async withRetry<T>(
    fn: () => Promise<ApiResponse<T>>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 408, 429
        if (error instanceof ApiError) {
          const shouldRetry = error.status >= 500 || 
                            error.status === 408 || 
                            error.status === 429;
          
          if (!shouldRetry || attempt === retries) {
            throw error;
          }
        }

        if (attempt < retries) {
          await this.sleep(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { retries, ...fetchOptions } = options;
    
    return this.withRetry(
      () => this.makeRequest<T>(endpoint, { ...fetchOptions, method: 'GET' }),
      retries
    );
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { retries, ...fetchOptions } = options;
    
    return this.withRetry(
      () => this.makeRequest<T>(endpoint, {
        ...fetchOptions,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      }),
      retries
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { retries, ...fetchOptions } = options;
    
    return this.withRetry(
      () => this.makeRequest<T>(endpoint, {
        ...fetchOptions,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
      }),
      retries
    );
  }

  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { retries, ...fetchOptions } = options;
    
    return this.withRetry(
      () => this.makeRequest<T>(endpoint, { ...fetchOptions, method: 'DELETE' }),
      retries
    );
  }

  // Form data submission
  async submitForm<T>(
    endpoint: string,
    formData: FormData,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { headers, ...otherOptions } = options;
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    const formOptions = {
      ...otherOptions,
      method: 'POST',
      body: formData,
      headers: {
        ...headers
      }
    };
    
    // Remove Content-Type to let browser handle it for FormData
    delete (formOptions.headers as any)['Content-Type'];

    return this.makeRequest<T>(endpoint, formOptions);
  }

  // Cancel all active requests
  cancelAll(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  // Cancel specific request
  cancel(endpoint: string, method: string = 'GET'): void {
    const requestId = `${method}-${endpoint}`;
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient('/api');

// Convenience functions for common operations
export const api = {
  // Lead capture
  submitLead: (data: any) => apiClient.post('/lead-capture', data),
  
  // Newsletter signup
  subscribeNewsletter: (email: string) => 
    apiClient.submitForm('/newsletter-signup', new FormData([['email', email]])),
  
  // Demo generation
  generateDemo: (demoData: any) => apiClient.post('/generate-demo', demoData),
  
  // Generic form submission
  submitForm: <T>(endpoint: string, data: any) => apiClient.post<T>(endpoint, data),
};

// React hook for API calls with loading states
export function useApiCall<T>() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<T | null>(null);

  const execute = async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { loading, error, data, execute, reset };
}

export default apiClient;