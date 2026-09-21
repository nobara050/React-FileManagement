import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import { rolesApi } from '../../../api/roles.api';

const AVAILABLE_PERMISSIONS = [
  {
    value: 'drive.read',
    label: 'drive.read',
    name: 'View & Preview (Read)',
    description: 'Browse folders, files, and preview contents directly',
    icon: <VisibilityIcon fontSize="small" />,
    color: 'info',
  },
  {
    value: 'drive.download',
    label: 'drive.download',
    name: 'Download (Download)',
    description: 'Download files to your local device',
    icon: <DownloadIcon fontSize="small" />,
    color: 'primary',
  },
  {
    value: 'drive.create',
    label: 'drive.create',
    name: 'Create & Upload (Create)',
    description: 'Create new folders and upload files to Drive',
    icon: <CreateNewFolderIcon fontSize="small" />,
    color: 'success',
  },
  {
    value: 'drive.update',
    label: 'drive.update',
    name: 'Rename (Update)',
    description: 'Rename files and folders',
    icon: <DriveFileRenameOutlineIcon fontSize="small" />,
    color: 'warning',
  },
  {
    value: 'drive.move',
    label: 'drive.move',
    name: 'Move Location (Move)',
    description: 'Move files and folders between directories in the system',
    icon: <DriveFileMoveIcon fontSize="small" />,
    color: 'secondary',
  },
  {
    value: 'drive.delete',
    label: 'drive.delete',
    name: 'Delete Items (Delete)',
    description: 'Delete files and folders to trash',
    icon: <DeleteSweepIcon fontSize="small" />,
    color: 'error',
  },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const [roleToRename, setRoleToRename] = useState(null);
  const [updatedRoleName, setUpdatedRoleName] = useState('');

  const [roleToDelete, setRoleToDelete] = useState(null);

  // Permission Configuration Modal
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [selectedClaims, setSelectedClaims] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await rolesApi.listRoles();
      setRoles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load roles list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Open Permission Modal with current claims pre-selected
  const handleOpenPermissionsModal = (role) => {
    setSelectedRoleForPermissions(role);
    setSelectedClaims(role.claims ? [...role.claims] : []);
  };

  const handleToggleClaim = (claimValue) => {
    setSelectedClaims((prev) =>
      prev.includes(claimValue)
        ? prev.filter((c) => c !== claimValue)
        : [...prev, claimValue]
    );
  };

  const handleSelectAllClaims = () => {
    setSelectedClaims(AVAILABLE_PERMISSIONS.map((p) => p.value));
  };

  const handleClearAllClaims = () => {
    setSelectedClaims([]);
  };

  // Save Permissions Batch
  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return;
    setActionLoading(true);
    setError('');
    try {
      const originalClaims = selectedRoleForPermissions.claims || [];
      const toAdd = selectedClaims.filter((c) => !originalClaims.includes(c));
      const toRemove = originalClaims.filter((c) => !selectedClaims.includes(c));

      const promises = [
        ...toAdd.map((claim) => rolesApi.addRoleClaim(selectedRoleForPermissions.roleId, claim)),
        ...toRemove.map((claim) => rolesApi.removeRoleClaim(selectedRoleForPermissions.roleId, claim)),
      ];

      await Promise.all(promises);

      setNotification(`Permissions updated for role "${selectedRoleForPermissions.name}" successfully.`);
      setSelectedRoleForPermissions(null);
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to update permissions.');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setActionLoading(true);
    try {
      await rolesApi.createRole(newRoleName.trim());
      setNotification(`Role "${newRoleName.trim()}" created successfully.`);
      setIsCreateOpen(false);
      setNewRoleName('');
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to create role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Rename Role
  const handleRenameRole = async (e) => {
    e.preventDefault();
    if (!roleToRename || !updatedRoleName.trim()) return;
    setActionLoading(true);
    try {
      await rolesApi.renameRole(roleToRename.roleId, updatedRoleName.trim());
      setNotification(`Role renamed to "${updatedRoleName.trim()}".`);
      setRoleToRename(null);
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to rename role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setActionLoading(true);
    try {
      await rolesApi.deleteRole(roleToDelete.roleId);
      setNotification(`Role "${roleToDelete.name}" deleted successfully.`);
      setRoleToDelete(null);
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to delete role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Claim shortcut from card chip
  const handleRemoveClaim = async (role, claimValue) => {
    try {
      await rolesApi.removeRoleClaim(role.roleId, claimValue);
      setNotification(`Claim "${claimValue}" removed from role "${role.name}".`);
      await fetchRoles();
    } catch (err) {
      setError(err.message || 'Failed to remove claim.');
    }
  };

  const handleCopyRoleId = (roleId) => {
    navigator.clipboard.writeText(roleId);
    setNotification('Copied Role ID to clipboard.');
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Roles & Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system roles and configure granular Drive permission claims
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Create New Role
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Roles List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : roles.filter((r) => r.name !== 'Admin').length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">No custom roles available</Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Create New Role" above to create and configure custom roles.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {roles
            .filter((role) => role.name !== 'Admin')
            .map((role) => {
              const claims = role.claims || [];
              const permissionRatio = `${claims.length}/${AVAILABLE_PERMISSIONS.length}`;

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={role.roleId}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Role Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                            }}
                          >
                            <SecurityIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                              {role.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Custom Role
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Rename role">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setRoleToRename(role);
                                setUpdatedRoleName(role.name);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete role">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setRoleToDelete(role)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Permissions Header & Action */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                            Drive Permissions
                          </Typography>
                          <Chip
                            label={permissionRatio}
                            size="small"
                            color={claims.length > 0 ? 'primary' : 'default'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                          />
                        </Box>

                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<KeyIcon fontSize="small" />}
                          onClick={(e) => {
                            e.currentTarget.blur();
                            handleOpenPermissionsModal(role);
                          }}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            py: 0.4,
                            px: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          Configure Permissions
                        </Button>
                      </Box>

                      {/* Permissions list chips */}
                      <Box sx={{ flexGrow: 1 }}>
                        {claims.length === 0 ? (
                          <Box sx={{ py: 1.5, px: 1, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              No permissions assigned yet. Click "Configure Permissions" to assign.
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, pt: 0.5 }}>
                            {claims.map((claim) => {
                              const permMeta = AVAILABLE_PERMISSIONS.find((p) => p.value === claim);
                              return (
                                <Chip
                                  key={claim}
                                  icon={permMeta?.icon}
                                  label={claim}
                                  size="small"
                                  color={permMeta?.color || 'primary'}
                                  variant="outlined"
                                  onDelete={() => handleRemoveClaim(role, claim)}
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    '& .MuiChip-icon': { ml: 0.5 },
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      )}

      {/* Permission Configuration Multi-Select Form Modal */}
      <Dialog
        open={Boolean(selectedRoleForPermissions)}
        onClose={() => !actionLoading && setSelectedRoleForPermissions(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle component="div" sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <KeyIcon />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Configure Permissions for "{selectedRoleForPermissions?.name}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select the Drive permissions you want to grant to this role
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          {/* Quick Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" fontWeight="600" color="text.secondary">
              Selected: <strong style={{ color: '#1976d2' }}>{selectedClaims.length}</strong> / {AVAILABLE_PERMISSIONS.length} permissions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectAllClaims}
                disabled={actionLoading}
                sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
              >
                Select All
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleClearAllClaims}
                disabled={actionLoading}
                sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
              >
                Clear All
              </Button>
            </Box>
          </Box>

          {/* Permissions Checklist Tiles */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isChecked = selectedClaims.includes(perm.value);

              return (
                <Paper
                  key={perm.value}
                  variant="outlined"
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onClick={() => !actionLoading && handleToggleClaim(perm.value)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      if (!actionLoading) handleToggleClaim(perm.value);
                    }
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    cursor: actionLoading ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    userSelect: 'none',
                    transition: 'all 0.15s ease-in-out',
                    borderColor: isChecked ? 'primary.main' : 'divider',
                    bgcolor: isChecked ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: isChecked ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                    disabled={actionLoading}
                    color="primary"
                    sx={{ p: 0.5, pointerEvents: 'none' }}
                  />

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                        {perm.name}
                      </Typography>
                      <Chip
                        label={perm.value}
                        size="small"
                        color={perm.color || 'default'}
                        variant={isChecked ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {perm.description}
                    </Typography>
                  </Box>

                  {isChecked && (
                    <CheckCircleIcon color="primary" sx={{ fontSize: 20, flexShrink: 0, mr: 0.5 }} />
                  )}
                </Paper>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Click "Save Permissions" to apply changes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setSelectedRoleForPermissions(null)}
              disabled={actionLoading}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              autoFocus
              onClick={handleSavePermissions}
              variant="contained"
              color="primary"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{ borderRadius: 2, px: 2.5, fontWeight: 600 }}
            >
              {actionLoading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Create Role Modal */}
      <Dialog
        open={isCreateOpen}
        onClose={() => !actionLoading && setIsCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold">Create New Role</DialogTitle>
        <form onSubmit={handleCreateRole}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Role Name"
              placeholder="e.g. Contributor, Auditor"
              fullWidth
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              disabled={actionLoading}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setIsCreateOpen(false)} disabled={actionLoading} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newRoleName.trim() || actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Rename Role Modal */}
      <Dialog
        open={Boolean(roleToRename)}
        onClose={() => !actionLoading && setRoleToRename(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold">Rename Role</DialogTitle>
        <form onSubmit={handleRenameRole}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Role Name"
              fullWidth
              value={updatedRoleName}
              onChange={(e) => setUpdatedRoleName(e.target.value)}
              required
              disabled={actionLoading}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRoleToRename(null)} disabled={actionLoading} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!updatedRoleName.trim() || actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog
        open={Boolean(roleToDelete)}
        onClose={() => !actionLoading && setRoleToDelete(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold" color="error.main">Delete Role?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete role <strong>{roleToDelete?.name}</strong>?
            All assigned Drive permissions will be cleaned up automatically.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleToDelete(null)} disabled={actionLoading} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRole}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

