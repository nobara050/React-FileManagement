import { api } from './client';

export const usersApi = {
  /**
   * List all users (Admin only).
   * @returns {Promise<Array<{ userId: string, email: string, displayName: string, avatarUrl?: string }>>}
   */
  listUsers: async () => {
    return api.get('/users');
  },

  /**
   * Get user details by user ID (Admin only).
   * @param {string} userId
   * @returns {Promise<{ userId: string, email: string, displayName: string, avatarUrl?: string }>}
   */
  getUser: async (userId) => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Delete user by user ID (Admin only).
   * @param {string} userId
   * @returns {Promise<null>}
   */
  deleteUser: async (userId) => {
    return api.delete(`/users/${userId}`);
  },

  /**
   * Search users by email or display name substring (Authenticated).
   * @param {string} query
   * @returns {Promise<Array<{ userId: string, email: string, displayName: string, avatarUrl?: string }>>}
   */
  searchUsers: async (query) => {
    return api.get(`/users/search?query=${encodeURIComponent(query)}`);
  },
};
