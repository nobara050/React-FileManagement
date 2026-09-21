import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { usersApi } from '../../../api/users.api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (searchQuery.trim().length >= 2) {
        const searchResults = await usersApi.searchUsers(searchQuery.trim());
        setUsers(searchResults || []);
      } else {
        const data = await usersApi.listUsers();
        setUsers(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users list.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await usersApi.deleteUser(userToDelete.userId);
      setNotification(`User "${userToDelete.displayName || userToDelete.email}" deleted successfully.`);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setNotification('User ID copied to clipboard!');
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Users Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system accounts, user identities, and directory members
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter and Refresh Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 350 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Refresh
        </Button>
      </Paper>

      {/* Users Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f4f6f8' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matching users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isCurrentAdmin = u.userId === currentAdmin?.userId;

                return (
                  <TableRow key={u.userId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={u.avatarUrl}
                          sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}
                        >
                          {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {u.displayName || 'Unnamed User'}
                          </Typography>
                          {isCurrentAdmin && (
                            <Chip
                              label="You (Current)"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 18 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                          }}
                        >
                          {u.userId}
                        </Typography>
                        <Tooltip title="Copy User ID">
                          <IconButton size="small" onClick={() => handleCopyId(u.userId)}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedUser(u)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isCurrentAdmin ? 'Cannot delete the currently signed-in account' : 'Delete account'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={isCurrentAdmin}
                            onClick={() => setUserToDelete(u)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Details Modal */}
      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold">User Account Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
              <Avatar
                src={selectedUser.avatarUrl}
                sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}
              >
                {(selectedUser.displayName || selectedUser.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {selectedUser.displayName || 'Unnamed User'}
              </Typography>

              <Box sx={{ width: '100%', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ mb: 1.5 }}>
                  {selectedUser.email}
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block">
                  User ID
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {selectedUser.userId}
                  </Typography>
                  <IconButton size="small" onClick={() => handleCopyId(selectedUser.userId)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedUser(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(userToDelete)}
        onClose={() => !actionLoading && setUserToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold" color="error.main">
          Delete User Account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete user <strong>{userToDelete?.displayName || userToDelete?.email}</strong>? 
            This action will remove the account and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setUserToDelete(null)}
            disabled={actionLoading}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification('')}
        message={notification}
      />
    </Box>
  );
}
