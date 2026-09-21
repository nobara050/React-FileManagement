import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function DriveItemContextMenu({
  anchorEl,
  contextMenu, // contains position { mouseX, mouseY }
  onClose,
  item,
  onPreview,
  onDelete,
  onShare,
  onDownload,
  onRename,
  onMove,
}) {
  const open = Boolean(anchorEl) || Boolean(contextMenu);
  const position = contextMenu
    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
    : undefined;

  const handleAction = (callback) => {
    onClose();
    if (callback && item) {
      callback(item);
    }
  };

  if (!item) {
    return null;
  }

  const isFile = item.itemType === 1 || item.itemType === 'File';
  const isFolder = item.itemType === 2 || item.itemType === 'Folder';

  // Only show the menu if there is at least one visible action
  const hasActions =
    (onPreview && isFile) ||
    onRename ||
    onMove ||
    onShare ||
    (onDownload && isFile) ||
    onDelete;

  if (!hasActions) {
    return null;
  }

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference={contextMenu ? 'anchorPosition' : 'anchorEl'}
      anchorPosition={position}
      anchorEl={anchorEl}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            minWidth: 180,
            borderRadius: 2,
          },
        },
      }}
    >
      <MenuItem disabled sx={{ opacity: '0.8 !important' }}>
        <ListItemText
          primary={item.name}
          secondary={isFolder ? 'Folder' : 'File'}
          slotProps={{
            primary: {
              variant: 'caption',
              fontWeight: 'bold',
              noWrap: true,
            },
          }}
        />
      </MenuItem>
      <Divider />

      {onPreview && isFile && (
        <MenuItem onClick={() => handleAction(onPreview)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Preview" />
        </MenuItem>
      )}

      {onRename && (
        <MenuItem onClick={() => handleAction(onRename)}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
      )}

      {onMove && (
        <MenuItem onClick={() => handleAction(onMove)}>
          <ListItemIcon>
            <DriveFileMoveIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Move" />
        </MenuItem>
      )}

      {onShare && (
        <MenuItem onClick={() => handleAction(onShare)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Share" />
        </MenuItem>
      )}

      {onDownload && isFile && (
        <MenuItem onClick={() => handleAction(onDownload)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Download" />
        </MenuItem>
      )}

      {onDelete && <Divider />}

      {onDelete && (
        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      )}
    </Menu>
  );
}
