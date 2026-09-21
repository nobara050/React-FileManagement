const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom API client for ASP.NET Core backend.
 * Automatically attaches JWT Bearer token and handles error responses.
 */
export async function apiClient(endpoint, options = {}) {
  const { body, headers = {}, isFormData = false, ...customConfig } = options;

  const token = localStorage.getItem('accessToken');
  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body && typeof body === 'object') {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method: options.method || (body ? 'POST' : 'GET'),
    ...customConfig,
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

  // Handle unauthorized (expired or invalid token)
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (cleanEndpoint === '/auth/logout' || cleanEndpoint.endsWith('/logout')) {
      return null;
    }
    window.dispatchEvent(new Event('auth:unauthorized'));
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  // Handle empty successful responses (204 No Content)
  if (response.status === 204) {
    return null;
  }

  // Check if response is JSON (including application/problem+json)
  const contentType = response.headers.get('content-type');
  const isJson = contentType && (contentType.includes('application/json') || contentType.includes('application/problem+json') || contentType.includes('+json'));
  let data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // If response was read as text, attempt to parse as JSON in case header was plain text
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // keep as string
      }
    }

    // Extract validation errors or problem details from ASP.NET
    let errorMessage = 'An unexpected error occurred';
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (Array.isArray(data)) {
        // ASP.NET Identity errors: [{ code, description }] or string[]
        const errorStrings = data.map((item) =>
          typeof item === 'string' ? item : item?.description || item?.message || item?.code || ''
        );
        errorMessage = errorStrings.filter(Boolean).join(', ') || errorMessage;
      } else if (data.errors && typeof data.errors === 'object') {
        // FluentValidation / ProblemDetails format
        const fieldErrors = Object.values(data.errors).flat();
        errorMessage = fieldErrors.join(', ') || data.title || errorMessage;
      } else if (data.detail || data.title || data.message) {
        errorMessage = data.detail || data.title || data.message;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, options = {}) => apiClient(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => apiClient(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => apiClient(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options = {}) => apiClient(url, { ...options, method: 'PATCH', body }),
  delete: (url, options = {}) => apiClient(url, { ...options, method: 'DELETE' }),
};

