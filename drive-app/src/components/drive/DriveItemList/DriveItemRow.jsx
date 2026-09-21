import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../../context/AuthContext';

export default function DriveItemRow({ item, onDoubleClick, onMenuClick, onContextMenu, hideMenu = false }) {
  const { user } = useAuth();
  const isFolder = item.itemType === 2 || item.itemType === 'Folder';

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(item);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick(e, item);
    }
  };

  const handleContextMenu = (e) => {
    if (onContextMenu) {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, item);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOwnerEmail = () => {
    if (item.ownerEmail) return item.ownerEmail;
    if (item.owner?.email) return item.owner.email;
    if (user && item.ownerId && user.userId === item.ownerId) {
      return user.email || user.displayName || 'me';
    }
    if (user?.email) {
      return user.email;
    }
    return item.ownerName || item.ownerDisplayName || user?.displayName || 'me';
  };

  return (
    <TableRow
      hover
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Name Column */}
      <TableCell component="th" scope="row">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isFolder ? (
            <FolderIcon sx={{ color: 'text.secondary' }} />
          ) : (
            <InsertDriveFileIcon sx={{ color: 'primary.main' }} />
          )}
          <Typography variant="body2" fontWeight="500" noWrap sx={{ maxWidth: { xs: 200, sm: 300 } }}>
            {item.name}
          </Typography>
        </Box>
      </TableCell>

      {/* Owner Column */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
        <Typography variant="body2" color="text.secondary">
          {getOwnerEmail()}
        </Typography>
      </TableCell>

      {/* Last Modified Column */}
      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(item.updatedAt || item.createdAt)}
        </Typography>
      </TableCell>

      {/* File Size Column */}
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {isFolder ? '—' : `${(item.size / 1024).toFixed(1)} KB`}
        </Typography>
      </TableCell>

      {/* Menu Column */}
      <TableCell align="right" sx={{ width: 50 }}>
        {!hideMenu && (
          <IconButton size="small" aria-label="row action" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}
