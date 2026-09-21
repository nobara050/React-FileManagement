import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import DriveBreadcrumbs from '../../components/drive/Breadcrumb/DriveBreadcrumbs';
import DriveToolbar from '../../components/drive/Toolbar/DriveToolbar';
import DriveItemGrid from '../../components/drive/DriveItemGrid/DriveItemGrid';
import DriveItemList from '../../components/drive/DriveItemList/DriveItemList';
import CreateFolderModal from '../../components/drive/CreateFolderModal/CreateFolderModal';
import UploadModal from '../../components/drive/UploadModal/UploadModal';
import MoveModal from '../../components/drive/MoveModal/MoveModal';
import DriveItemContextMenu from '../../components/drive/DriveItemContextMenu/DriveItemContextMenu';
import FilePreviewModal from '../../components/drive/FilePreviewModal/FilePreviewModal';

import { driveApi } from '../../api/drive.api';

export default function SharedPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('searchTerm') || '';

  const [view, setView] = useState('grid');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modals & Action States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');

  // Context Menu & Preview
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextItem, setContextItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const currentFolderId = folderId || null;
  const currentFolderName = location.state?.folderName || (currentFolderId ? 'Folder' : null);

  // Fetch items explicitly shared with the current user or subfolder contents
  const fetchSharedItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        pageNumber: 1,
        pageSize: 100,
      };
      if (currentFolderId) {
        params.parentId = currentFolderId;
      } else {
        params.scope = 'Shared';
      }
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      const data = await driveApi.listDriveItems(params);
      setItems(data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load shared items.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, searchTerm]);

  useEffect(() => {
    fetchSharedItems();
  }, [fetchSharedItems]);

  const handleItemDoubleClick = (item) => {
    if (item.itemType === 2 || item.itemType === 'Folder') {
      const effectiveParentId = currentFolderId ? item.parentId : null;

      if (effectiveParentId) {
        sessionStorage.setItem(`folder_parent_${item.id}`, effectiveParentId);
      } else {
        sessionStorage.removeItem(`folder_parent_${item.id}`);
      }
      if (item.name) {
        sessionStorage.setItem(`folder_name_${item.id}`, item.name);
      }
      navigate(`/shared/folder/${item.id}`, {
        state: {
          folderName: item.name,
          parentId: effectiveParentId,
        },
      });
    } else {
      // Open file preview
      setPreviewItem(item);
    }
  };

  const handleMenuClick = (event, item) => {
    setContextItem(item);
    setMenuAnchorEl(event.currentTarget);
    setContextMenu(null);
  };

  const handleContextMenu = (event, item) => {
    event.preventDefault();
    setContextItem(item);
    setMenuAnchorEl(null);
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleCloseMenus = () => {
    setMenuAnchorEl(null);
    setContextMenu(null);
  };

  const handleCreateFolder = async (name) => {
    try {
      await driveApi.createFolder({ parentId: currentFolderId, name });
      setNotification(`Folder "${name}" created.`);
      setIsFolderModalOpen(false);
      await fetchSharedItems();
    } catch (err) {
      setError(err.message || 'Failed to create folder.');
    }
  };

  const handleUploadFile = async (file) => {
    try {
      await driveApi.uploadFile({ parentId: currentFolderId, file });
      setNotification(`File "${file.name}" uploaded successfully.`);
      setIsUploadModalOpen(false);
      await fetchSharedItems();
    } catch (err) {
      setError(err.message || 'Failed to upload file.');
      throw err;
    }
  };

  const handleDeleteItem = async (itemToDelete) => {
    try {
      await driveApi.deleteDriveItem(itemToDelete.id);
      const typeLabel = (itemToDelete.itemType === 2 || itemToDelete.itemType === 'Folder') ? 'Folder' : 'File';
      setNotification(`${typeLabel} "${itemToDelete.name}" moved to Trash.`);
      await fetchSharedItems();
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    }
  };

  const handleOpenRename = (item) => {
    setRenameItem(item);
    setNewName(item.name || '');
  };

  const handleOpenMove = (item) => {
    setMoveItem(item);
  };

  const handleDownloadFile = async (item) => {
    try {
      await driveApi.downloadFile(item);
      setNotification(`Downloading "${item.name}"...`);
    } catch (err) {
      setError(err.message || 'Failed to generate download link.');
    }
  };

  const handleMoveSubmit = async (destinationFolderId) => {
    if (!moveItem) return;
    try {
      await driveApi.moveItem(moveItem.id, destinationFolderId);
      const targetLabel = destinationFolderId ? 'target folder' : 'My Drive';
      setNotification(`Moved "${moveItem.name}" to ${targetLabel}.`);
      setMoveItem(null);
      await fetchSharedItems();
    } catch (err) {
      setError(err.message || 'Failed to move item.');
      throw err;
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameItem || !newName.trim()) return;
    try {
      await driveApi.renameItem(renameItem.id, newName.trim());
      setNotification(`Renamed to "${newName.trim()}".`);
      setRenameItem(null);
      setNewName('');
      await fetchSharedItems();
    } catch (err) {
      setError(err.message || 'Failed to rename item.');
    }
  };

  const currentParentId = location.state?.parentId !== undefined
    ? location.state.parentId
    : (currentFolderId ? sessionStorage.getItem(`folder_parent_${currentFolderId}`) : null);

  const handleFolderTitleClick = () => {
    if (currentParentId) {
      const parentName = sessionStorage.getItem(`folder_name_${currentParentId}`);
      navigate(`/shared/folder/${currentParentId}`, {
        state: {
          folderName: parentName || undefined,
        },
      });
    } else {
      navigate('/shared');
    }
  };

  const folderDisplayName = currentFolderName || (currentFolderId ? sessionStorage.getItem(`folder_name_${currentFolderId}`) || 'Folder' : null);

  const breadcrumbPath = currentFolderId && folderDisplayName
    ? [{ id: currentFolderId, name: folderDisplayName }]
    : [];

  return (
    <Box sx={{ height: '100%' }}>
      {/* Breadcrumb showing "Shared with me" */}
      <DriveBreadcrumbs
        path={breadcrumbPath}
        scope="shared"
        onParentClick={handleFolderTitleClick}
      />

      {/* Toolbar actions */}
      <DriveToolbar
        view={view}
        onViewChange={setView}
        onCreateFolderClick={() => setIsFolderModalOpen(true)}
        onUploadFileClick={() => setIsUploadModalOpen(true)}
        showNewButton={Boolean(currentFolderId)}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Main Grid or List View */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : view === 'grid' ? (
        <DriveItemGrid
          items={items}
          onDoubleClick={handleItemDoubleClick}
          onMenuClick={handleMenuClick}
          onContextMenu={handleContextMenu}
        />
      ) : (
        <DriveItemList
          items={items}
          onDoubleClick={handleItemDoubleClick}
          onMenuClick={handleMenuClick}
          onContextMenu={handleContextMenu}
        />
      )}

      {/* Folder Creation Modal */}
      <CreateFolderModal
        open={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Upload File Modal */}
      <UploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadFile}
      />

      {/* Move Folder/File Modal */}
      <MoveModal
        open={Boolean(moveItem)}
        onClose={() => setMoveItem(null)}
        item={moveItem}
        scope="Shared"
        initialFolder={currentFolderId ? { id: currentFolderId, name: folderDisplayName || 'Shared Folder' } : null}
        onMoveSubmit={handleMoveSubmit}
      />

      {/* Rename Modal */}
      <Dialog
        open={Boolean(renameItem)}
        onClose={() => setRenameItem(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold">Rename</DialogTitle>
        <form onSubmit={handleRenameSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New name"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRenameItem(null)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!newName.trim()}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Item Action Context Menu */}
      <DriveItemContextMenu
        anchorEl={menuAnchorEl}
        contextMenu={contextMenu}
        onClose={handleCloseMenus}
        item={contextItem}
        onPreview={(item) => setPreviewItem(item)}
        onDelete={handleDeleteItem}
        onDownload={handleDownloadFile}
        onRename={handleOpenRename}
        onMove={handleOpenMove}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        item={previewItem}
      />

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification('')}
        message={notification}
      />
    </Box>
  );
}
