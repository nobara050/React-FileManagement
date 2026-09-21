import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';

import SidebarNavItem from './SidebarNavItem';

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
      {/* Brand logo - shown in Sidebar (only relevant when permanent/desktop) */}
      <Box
        onClick={() => navigate('/drive')}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          px: 3,
          mb: 3,
          gap: 1.5,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <CloudQueueIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Drive
        </Typography>
      </Box>

      {/* Navigation list */}
      <List sx={{ px: 0 }}>
        <SidebarNavItem
          icon={<FolderIcon />}
          label="My Drive"
          to="/drive"
          onClick={onClose}
        />
        <SidebarNavItem
          icon={<PeopleIcon />}
          label="Shared with me"
          to="/shared"
          onClick={onClose}
        />
        <SidebarNavItem
          icon={<DeleteIcon />}
          label="Trash"
          to="/trash"
          onClick={onClose}
        />
      </List>

      <Divider sx={{ my: 2 }} />
    </Box>
  );

  return drawerContent;
}
