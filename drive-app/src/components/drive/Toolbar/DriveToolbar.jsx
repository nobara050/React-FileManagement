import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function DriveToolbar({
  view = 'grid',
  onViewChange,
  onCreateFolderClick,
  onUploadFileClick,
  showNewButton = true
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleNewClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateFolder = () => {
    handleClose();
    if (onCreateFolderClick) onCreateFolderClick();
  };

  const handleUploadFile = () => {
    handleClose();
    if (onUploadFileClick) onUploadFileClick();
  };

  const handleViewChange = (event, nextView) => {
    if (nextView !== null && onViewChange) {
      onViewChange(nextView);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      {/* Left: "+ New" button */}
      <Box sx={{ minWidth: 120 }}>
        {showNewButton && (
          <>
            <Button
              id="new-button"
              aria-controls={open ? 'new-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewClick}
              sx={{
                py: 1.2,
                px: 3,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                '&:hover': {
                  boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
                },
              }}
            >
              New
            </Button>
            <Menu
              id="new-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'new-button',
              }}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    borderRadius: 2,
                    mt: 0.5,
                    minWidth: 180,
                  },
                },
              }}
            >
              <MenuItem onClick={handleCreateFolder}>
                <CreateNewFolderIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                New folder
              </MenuItem>
              <MenuItem onClick={handleUploadFile}>
                <UploadFileIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                File upload
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Right: View Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view list grid"
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view" sx={{ borderRadius: '18px 0 0 18px', px: 2 }}>
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view" sx={{ borderRadius: '0 18px 18px 0', px: 2 }}>
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
