import { api } from './client';

export const rolesApi = {
  /**
   * List all available roles in the system.
   * @returns {Promise<Array<{ roleId: string, name: string, claims: string[] }>>}
   */
  listRoles: async () => {
    return api.get('/roles');
  },

  /**
   * Get role details by role ID (Admin only).
   * @param {string} roleId
   * @returns {Promise<{ roleId: string, name: string, claims: string[] }>>}
   */
  getRole: async (roleId) => {
    return api.get(`/roles/${roleId}`);
  },

  /**
   * Create a new role (Admin only).
   * @param {string} name
   * @returns {Promise<{ roleId: string, name: string, claims: string[] }>}
   */
  createRole: async (name) => {
    return api.post('/roles', { name });
  },

  /**
   * Rename an existing role (Admin only).
   * @param {string} roleId
   * @param {string} newName
   * @returns {Promise<null>}
   */
  renameRole: async (roleId, newName) => {
    return api.put(`/roles/${roleId}/name`, { newName });
  },

  /**
   * Delete a role and cleanup references (Admin only).
   * @param {string} roleId
   * @returns {Promise<null>}
   */
  deleteRole: async (roleId) => {
    return api.delete(`/roles/${roleId}`);
  },

  /**
   * Add a permission claim to a role (Admin only).
   * @param {string} roleId
   * @param {string} claimValue e.g. "drive.read", "drive.create"
   * @returns {Promise<null>}
   */
  addRoleClaim: async (roleId, claimValue) => {
    return api.post(`/roles/${roleId}/claims`, { claimValue });
  },

  /**
   * Remove a permission claim from a role (Admin only).
   * @param {string} roleId
   * @param {string} claimValue
   * @returns {Promise<null>}
   */
  removeRoleClaim: async (roleId, claimValue) => {
    return api.delete(`/roles/${roleId}/claims/${encodeURIComponent(claimValue)}`);
  },
};
