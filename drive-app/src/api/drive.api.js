import { api, apiClient } from './client';

export const driveApi = {
  /**
   * List drive items (files and folders).
   * @param {Object} params
   * @param {string|null} [params.parentId]
   * @param {'Owned'|'Shared'|'All'|number} [params.scope='Owned']
   * @param {string} [params.searchTerm]
   * @param {number} [params.itemType] 1 = File, 2 = Folder
   * @param {number} [params.pageNumber=1]
   * @param {number} [params.pageSize=50]
   * @returns {Promise<{ items: Array, pageNumber: number, pageSize: number, totalCount: number, totalPages: number }>}
   */
  listDriveItems: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.parentId) {
      query.append('parentId', params.parentId);
    }
    if (params.scope !== undefined && params.scope !== null) {
      query.append('scope', params.scope);
    }
    if (params.searchTerm) {
      query.append('searchTerm', params.searchTerm);
    }
    if (params.itemType) {
      query.append('itemType', params.itemType);
    }
    if (params.pageNumber) {
      query.append('pageNumber', params.pageNumber);
    }
    if (params.pageSize) {
      query.append('pageSize', params.pageSize);
    }

    const queryString = query.toString();
    const endpoint = `/drive-items${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Create a new folder.
   * @param {{ parentId?: string|null, name: string }} data
   * @returns {Promise<Object>} DriveItemResult
   */
  createFolder: async ({ parentId = null, name }) => {
    return api.post('/drive-items/folders', {
      parentId: parentId || null,
      name,
    });
  },

  /**
   * Upload a file via multipart/form-data.
   * @param {{ parentId?: string|null, file: File }} data
   * @returns {Promise<Object>} DriveItemResult
   */
  uploadFile: async ({ parentId = null, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }

    return apiClient('/drive-items/files', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  /**
   * Soft-delete a file or folder (owner or user with drive.delete).
   * Supports both files and folders (cascades to descendants for folders).
   * @param {string} driveItemId
   * @returns {Promise<null>}
   */
  deleteDriveItem: async (driveItemId) => {
    return api.delete(`/drive-items/${driveItemId}`);
  },

  /**
   * Soft-delete a file (legacy alias for deleteDriveItem).
   * @param {string} driveItemId
   * @returns {Promise<null>}
   */
  deleteFile: async (driveItemId) => {
    return api.delete(`/drive-items/${driveItemId}`);
  },

  /**
   * Recover a soft-deleted drive item from trash (owner only).
   * If recovering a folder, all cascaded descendants are also restored.
   * @param {string} driveItemId
   * @returns {Promise<Object>} RecoverDriveItemResult
   */
  recoverDriveItem: async (driveItemId) => {
    return api.post(`/drive-items/${driveItemId}/recover`);
  },

  /**
   * List soft-deleted items (trash) for the caller.
   * @param {Object} params
   * @param {string} [params.searchTerm]
   * @param {number} [params.itemType] 1 = File, 2 = Folder
   * @param {number} [params.pageNumber=1]
   * @param {number} [params.pageSize=50]
   * @returns {Promise<{ items: Array, pageNumber: number, pageSize: number, totalCount: number, totalPages: number }>}
   */
  listDeletedItems: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.searchTerm) {
      query.append('searchTerm', params.searchTerm);
    }
    if (params.itemType) {
      query.append('itemType', params.itemType);
    }
    if (params.pageNumber) {
      query.append('pageNumber', params.pageNumber);
    }
    if (params.pageSize) {
      query.append('pageSize', params.pageSize);
    }

    const queryString = query.toString();
    const endpoint = `/drive-items/deleted${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Permanently delete a single item from trash (owner or parent owner).
   * @param {string} driveItemId
   * @returns {Promise<null>}
   */
  hardDeleteTrashItem: async (driveItemId) => {
    return api.delete(`/drive-items/trash/${driveItemId}`);
  },

  /**
   * Permanently empty all soft-deleted items owned by caller.
   * @returns {Promise<null>}
   */
  emptyTrash: async () => {
    return api.delete('/drive-items/trash');
  },

  /**
   * Rename an item (owner only).
   * @param {string} id
   * @param {string} newName
   * @returns {Promise<Object>}
   */
  renameItem: async (id, newName) => {
    return api.patch(`/drive-items/${id}/rename`, { name: newName });
  },

  /**
   * Move an item to another folder (owner only).
   * @param {string} id
   * @param {string|null} destinationFolderId
   * @returns {Promise<Object>}
   */
  moveItem: async (id, destinationFolderId = null) => {
    return api.patch(`/drive-items/${id}/move`, { targetParentId: destinationFolderId });
  },

  /**
   * Get a pre-signed S3 download URL for a file.
   * @param {string} driveItemId
   * @returns {Promise<{ url: string, expiresAt: string }>}
   */
  getDownloadUrl: async (driveItemId) => {
    return api.get(`/drive-items/${driveItemId}/download`);
  },

  /**
   * Get a short-lived (15 min) pre-signed S3 URL for inline preview.
   * The URL serves the object inline so browsers can render it directly.
   * @param {string} driveItemId
   * @returns {Promise<{ url: string, expiresAt: string }>}
   */
  getPreviewUrl: async (driveItemId) => {
    return api.get(`/drive-items/${driveItemId}/preview`);
  },

  /**
   * Fetch a pre-signed download URL and trigger a browser file download.
   * @param {{ id: string, name: string }} item
   * @returns {Promise<void>}
   */
  downloadFile: async (item) => {
    const { url } = await driveApi.getDownloadUrl(item.id);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = item.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  },
};
