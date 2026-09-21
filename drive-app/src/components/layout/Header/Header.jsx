import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

export default function Header({ handleDrawerToggle, drawerWidth }) {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.default',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        {/* Left section: toggle button for mobile, logo placeholder */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            onClick={() => navigate('/drive')}
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <CloudQueueIcon color="primary" />
            <Typography variant="h6" fontWeight="bold" noWrap>
              Drive
            </Typography>
          </Box>
        </Box>

        {/* Center section: Search Bar */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchBar />
        </Box>

        {/* Right section: Profile/Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
