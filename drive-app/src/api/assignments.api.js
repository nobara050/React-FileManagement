import { api } from './client';

export const assignmentsApi = {
  /**
   * List all explicit and inherited assignments on a drive item (owner only).
   * @param {string} itemId
   * @returns {Promise<Array<{ userId: string, roleId: string, roleName: string, isExplicit: boolean, sourceItemId?: string }>>}
   */
  listAssignments: async (itemId) => {
    return api.get(`/drive-items/${itemId}/assignments`);
  },

  /**
   * Assign a role to a user on a drive item (owner only).
   * @param {string} itemId
   * @param {{ targetUserId?: string, targetEmail?: string, roleId: string }} data
   * @returns {Promise<null>}
   */
  assignRole: async (itemId, data) => {
    return api.post(`/drive-items/${itemId}/assignments`, data);
  },

  /**
   * Update a user's role on a drive item (owner only).
   * @param {string} itemId
   * @param {string} targetUserId
   * @param {{ newRoleId: string }} data
   * @returns {Promise<null>}
   */
  updateAssignment: async (itemId, targetUserId, { newRoleId }) => {
    return api.put(`/drive-items/${itemId}/assignments/${targetUserId}`, { newRoleId });
  },

  /**
   * Remove a user's explicit role assignment on a drive item (owner only).
   * @param {string} itemId
   * @param {string} targetUserId
   * @returns {Promise<null>}
   */
  removeAssignment: async (itemId, targetUserId) => {
    return api.delete(`/drive-items/${itemId}/assignments/${targetUserId}`);
  },
};
