import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export default function SidebarNavItem({ icon, label, to, onClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if active: path matches precisely or starts with route prefix
  const isActive = location.pathname.startsWith(to);

  const handleClick = () => {
    navigate(to);
    if (onClick) onClick();
  };

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: '0 24px 24px 0', // Round right side like Google Drive
          mr: 1.5,
          bgcolor: isActive ? 'primary.light' : 'transparent',
          color: isActive ? 'primary.main' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? 'primary.light' : 'action.hover',
          },
          '& .MuiListItemIcon-root': {
            color: isActive ? 'primary.main' : 'text.secondary',
            minWidth: 40,
          },
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
