import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

import { useAuth } from '../../../context/AuthContext';

export default function AdminProfilePage() {
  const { user, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const displayName = user?.displayName || user?.email || 'Administrator';
  const email = user?.email || 'admin@drive';
  const userId = user?.userId || user?.id || '—';

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP...).');
      return;
    }

    setUploading(true);
    setError('');
    try {
      await updateAvatar(file);
      setNotification('Avatar updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Admin Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          System administrator identity details and avatar settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Avatar and Quick Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={user?.avatarUrl}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: 36,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarFileChange}
              />

              <Button
                variant="contained"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
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

            <Typography variant="h6" fontWeight="bold">
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {email}
            </Typography>

            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="System Administrator"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 'bold', fontSize: '0.75rem', mb: 2 }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              startIcon={<PhotoCameraIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: Detailed Properties */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Identity Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BadgeIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Display Name
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {displayName}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {email}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FingerprintIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    User ID (GUID)
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', fontWeight: 600 }}>
                    {userId}
                  </Typography>
                </Box>
              </Box>
              
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
