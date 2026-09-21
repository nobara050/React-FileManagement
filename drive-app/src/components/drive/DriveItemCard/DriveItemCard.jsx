import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';

export default function DriveItemCard({ item, onDoubleClick, onMenuClick, onContextMenu, hideMenu = false }) {
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

  return (
    <Card
      elevation={0}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
        },
        userSelect: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* File/Folder Icon */}
          {isFolder ? (
            <FolderIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
          ) : (
            <InsertDriveFileIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          )}

          {/* Item details */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="500" noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {isFolder ? 'Folder' : `${(item.size / 1024).toFixed(1)} KB`}
            </Typography>
          </Box>

          {/* Three dots menu */}
          {!hideMenu && (
            <IconButton
              size="small"
              aria-label="item action"
              onClick={handleMenuClick}
              sx={{ flexShrink: 0 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
