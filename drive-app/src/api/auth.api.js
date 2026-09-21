import { api, apiClient } from './client';

export const authApi = {
  /**
   * Log in with email and password.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  login: async ({ email, password }) => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Register a new user account.
   * @param {{ email: string, password: string, displayName: string }} data
   * @returns {Promise<{ userId: string }>}
   */
  register: async ({ email, password, displayName }) => {
    return api.post('/auth/register', { email, password, displayName });
  },

  /**
   * Log out the current user (revokes active refresh tokens on server).
   * @param {string} [refreshToken]
   * @returns {Promise<null>}
   */
  logout: async (refreshToken = '') => {
    return api.post('/auth/logout', { refreshToken });
  },

  /**
   * Get current authenticated user profile.
   * @returns {Promise<{ id: string, email: string, displayName: string, avatarUrl?: string }>}
   */
  getMe: async () => {
    return api.get('/auth/me');
  },

  /**
   * Upload/update current user avatar to S3.
   * @param {File} file
   * @returns {Promise<{ avatarUrl: string }>}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient('/auth/me/avatar', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
};
