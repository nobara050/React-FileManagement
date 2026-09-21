import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import FolderIcon from '@mui/icons-material/Folder';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

import { driveApi } from '../../../api/drive.api';

export default function MoveModal({
  open,
  onClose,
  item,
  onMoveSubmit,
  scope = 'Owned',
  initialFolder = null,
}) {
  const isSharedScope = scope === 'Shared';
  const rootName = isSharedScope ? 'Shared with me' : 'My Drive';

  const getInitialStack = useCallback(() => {
    if (isSharedScope && initialFolder?.id) {
      return [
        { id: null, name: 'Shared with me' },
        { id: initialFolder.id, name: initialFolder.name || 'Shared Folder' },
      ];
    }
    return [{ id: null, name: rootName }];
  }, [isSharedScope, initialFolder, rootName]);

  const [navStack, setNavStack] = useState(getInitialStack());
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentFolder = navStack[navStack.length - 1];
  const currentFolderId = currentFolder ? currentFolder.id : null;

  // Reset navigation when modal opens with a new item
  useEffect(() => {
    if (open) {
      setNavStack(getInitialStack());
      setError('');
      setSubmitting(false);
    }
  }, [open, item, getInitialStack]);

  // Fetch folders in the current browsed directory
  const fetchFolders = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        itemType: 2, // Only folders
        pageNumber: 1,
        pageSize: 100,
      };
      if (currentFolderId) {
        params.parentId = currentFolderId;
      } else {
        params.scope = isSharedScope ? 'Shared' : 'Owned';
      }
      const data = await driveApi.listDriveItems(params);
      setFolders(data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load folders.');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [open, currentFolderId, isSharedScope]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleNavigateInto = (targetFolder) => {
    // If the target folder is the item itself (when moving a folder), cannot navigate into it
    if (item && (item.itemType === 2 || item.itemType === 'Folder') && targetFolder.id === item.id) {
      return;
    }
    setNavStack((prev) => [...prev, { id: targetFolder.id, name: targetFolder.name }]);
  };

  const handleNavigateBack = () => {
    if (navStack.length > 1) {
      setNavStack((prev) => prev.slice(0, -1));
    }
  };

  const handleBreadcrumbClick = (index) => {
    setNavStack((prev) => prev.slice(0, index + 1));
  };

  const handleConfirmMove = async () => {
    if (!item) return;
    setSubmitting(true);
    setError('');
    try {
      await onMoveSubmit(currentFolderId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to move item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  // Check if current destination is the same as the item's current parent
  const isCurrentParent = item.parentId === currentFolderId || (!item.parentId && currentFolderId === null);
  const isVirtualSharedRoot = isSharedScope && currentFolderId === null;

  return (
    <Dialog
      open={open}
      onClose={loading || submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            minHeight: 460,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DriveFileMoveIcon color="primary" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            Move "{item.name}"
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isSharedScope ? 'Select a destination folder within shared folders' : 'Select a destination folder in My Drive'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Breadcrumb path navigation inside modal */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            px: 1.5,
            py: 1,
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}
        >
          {navStack.length > 1 && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={handleNavigateBack}
              sx={{ minWidth: 'auto', mr: 1, px: 1 }}
            >
              Back
            </Button>
          )}

          <Breadcrumbs
            separator={<ChevronRightIcon fontSize="small" />}
            aria-label="folder navigation breadcrumb"
            sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {navStack.map((nav, index) => {
              const isLast = index === navStack.length - 1;
              return isLast ? (
                <Typography key={nav.id || 'root'} color="text.primary" variant="body2" fontWeight="bold">
                  {nav.name}
                </Typography>
              ) : (
                <Link
                  key={nav.id || 'root'}
                  component="button"
                  variant="body2"
                  underline="hover"
                  color="inherit"
                  onClick={() => handleBreadcrumbClick(index)}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {index === 0 && (
                    isSharedScope ? <FolderSharedIcon fontSize="inherit" /> : <CloudQueueIcon fontSize="inherit" />
                  )}
                  {nav.name}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Folder items list */}
        <Box sx={{ flex: 1, minHeight: 200, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress size={32} />
            </Box>
          ) : folders.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 180,
                color: 'text.secondary',
              }}
            >
              {isSharedScope ? (
                <FolderSharedIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              ) : (
                <FolderIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
              )}
              <Typography variant="body2">No subfolders here.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {folders.map((folder) => {
                const isSelf = (item.itemType === 2 || item.itemType === 'Folder') && folder.id === item.id;
                return (
                  <ListItemButton
                    key={folder.id}
                    disabled={isSelf}
                    onClick={() => handleNavigateInto(folder)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <FolderIcon color={isSelf ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={isSelf ? '(Current item cannot be target)' : null}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: '500',
                        color: isSelf ? 'text.disabled' : 'text.primary',
                      }}
                    />
                    <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {isVirtualSharedRoot && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
            Please select a shared folder to move into.
          </Typography>
        )}

        {isCurrentParent && !isVirtualSharedRoot && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
            Item is already in this location.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmMove}
          disabled={submitting || isCurrentParent || isVirtualSharedRoot}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <DriveFileMoveIcon />}
        >
          {submitting
            ? 'Moving...'
            : isVirtualSharedRoot
            ? 'Select a folder'
            : `Move to ${currentFolder ? currentFolder.name : 'here'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
