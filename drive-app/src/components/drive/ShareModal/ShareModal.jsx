import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { assignmentsApi } from '../../../api/assignments.api';
import { rolesApi } from '../../../api/roles.api';

export default function ShareModal({ open, onClose, item }) {
  const [assignments, setAssignments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states to add new assignment
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Load assignments and roles when modal opens
  const loadData = useCallback(async () => {
    if (!item?.id) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [assignmentsData, rolesData] = await Promise.all([
        assignmentsApi.listAssignments(item.id),
        rolesApi.listRoles(),
      ]);
      setAssignments(assignmentsData || []);
      // Filter roles: only Viewer and Editor apply to Drive items
      const driveRoles = (rolesData || []).filter((r) => r.name !== 'Admin');
      setRoles(driveRoles);
      if (driveRoles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(driveRoles[0].roleId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load permissions. Ensure you are the owner of this item.');
    } finally {
      setLoading(false);
    }
  }, [item, selectedRoleId]);

  useEffect(() => {
    if (open) {
      setTargetUserId('');
      setError('');
      setSuccess('');
      loadData();
    }
  }, [open, loadData]);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    const input = targetUserId.trim();
    if (!input || !selectedRoleId) {
      setError('Please enter target email or User ID and choose a role.');
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = input.includes('@')
        ? { targetEmail: input, roleId: selectedRoleId }
        : { targetUserId: input, roleId: selectedRoleId };

      await assignmentsApi.assignRole(item.id, payload);
      setSuccess('Permission assigned successfully.');
      setTargetUserId('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign role. Make sure the user exists.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRoleId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await assignmentsApi.updateAssignment(item.id, userId, { newRoleId });
      setSuccess('Role updated successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAssignment = async (userId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await assignmentsApi.removeAssignment(item.id, userId);
      setSuccess('Access removed successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to remove access.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle fontWeight="bold">
        Share "{item?.name}"
      </DialogTitle>

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

        {/* Info Box about Target User ID */}
        {/* Info Box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 1.5,
            mb: 2.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <InfoOutlinedIcon fontSize="small" color="primary" sx={{ mt: 0.2 }} />
          <Typography variant="caption" color="text.secondary">
            Role-Based Access Control: Enter email address or User ID (GUID) of the user to grant access. 
            Permissions automatically cascade to descendant items.
          </Typography>
        </Box>

        {/* Add collaborator form */}
        <Box
          component="form"
          onSubmit={handleAddAssignment}
          sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}
        >
          <TextField
            size="small"
            fullWidth
            label="Email or User ID"
            placeholder="e.g. user@test or 550e8400-e29b-..."
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            disabled={actionLoading || loading}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRoleId}
              label="Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={actionLoading || loading}
            >
              {roles.map((r) => (
                <MenuItem key={r.roleId} value={r.roleId}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            disabled={!targetUserId.trim() || actionLoading || loading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{ flexShrink: 0, py: 1 }}
          >
            Add
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Existing Assignments List */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          People with access ({assignments.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No external users have been granted access to this item yet.
          </Typography>
        ) : (
          <List dense disablePadding sx={{ mt: 1 }}>
            {assignments.map((assignment) => {
              const isDirect = assignment.isDirect ?? assignment.isExplicit;

              return (
                <ListItem
                  key={assignment.userId}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {assignment.userEmail || assignment.displayName || assignment.userId}
                        </Typography>
                        <Chip
                          size="small"
                          label={isDirect ? 'Direct' : 'Inherited'}
                          color={isDirect ? 'primary' : 'default'}
                          variant={isDirect ? 'filled' : 'outlined'}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                        {assignment.displayName && assignment.userEmail && assignment.displayName !== assignment.userEmail && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {assignment.displayName}
                          </Typography>
                        )}
                        <Typography component="span" variant="caption" color="text.disabled">
                          {!isDirect && assignment.sourceItemId
                            ? 'Inherited from ancestor folder'
                            : 'Direct assignment'}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDirect ? (
                      <>
                        <Select
                          size="small"
                          value={assignment.roleId}
                          onChange={(e) => handleUpdateRole(assignment.userId, e.target.value)}
                          disabled={actionLoading}
                          sx={{ fontSize: '0.8rem', height: 32 }}
                        >
                          {roles.map((r) => (
                            <MenuItem key={r.roleId} value={r.roleId} sx={{ fontSize: '0.8rem' }}>
                              {r.name}
                            </MenuItem>
                          ))}
                        </Select>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAssignment(assignment.userId)}
                          disabled={actionLoading}
                          title="Remove access"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Chip
                          size="small"
                          label={assignment.roleName}
                          sx={{ fontSize: '0.75rem' }}
                        />

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAssignment(assignment.userId)}
                          disabled={actionLoading}
                          title="Remove access for this item and descendants"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
