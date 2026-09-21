import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useAuth } from '../../../context/AuthContext';

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { user, logout, updateAvatar } = useAuth();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    handleMenuClose();
    setError('');
    setSuccess('');
    setProfileOpen(true);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP...).');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await updateAvatar(file);
      setSuccess('Avatar updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const displayName = user?.displayName || user?.email || (user?.userId ? `User ${user.userId.substring(0, 8)}` : 'User');
  const email = user?.email || '';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={user?.avatarUrl}
          sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}
        >
          {getInitials(displayName)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 280,
              borderRadius: 3,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Avatar
            src={user?.avatarUrl}
            sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: 20, mb: 1 }}
          >
            {getInitials(displayName)}
          </Avatar>
          <Typography fontWeight="bold" variant="subtitle1" color="text.primary" noWrap sx={{ maxWidth: 240 }}>
            {displayName}
          </Typography>
          {email && (
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 240 }}>
              {email}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleOpenProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>

      {/* Profile Modal */}
      <Dialog
        open={profileOpen}
        onClose={() => !uploading && setProfileOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold">User Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.avatarUrl}
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {getInitials(displayName)}
              </Avatar>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
              />

              <Button
                variant="contained"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  p: 0,
                }}
              >
                {uploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 18 }} />}
              </Button>
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              startIcon={<PhotoCameraIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {uploading ? 'Uploading...' : 'Change avatar'}
            </Button>

            <Box sx={{ width: '100%', bgcolor: 'action.hover', p: 2, borderRadius: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Display Name
              </Typography>
              <Typography variant="body1" fontWeight="600" sx={{ mb: 1.5 }}>
                {displayName}
              </Typography>

              <Typography variant="caption" color="text.secondary" display="block">
                Email Address
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {email}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProfileOpen(false)} variant="outlined" disabled={uploading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
