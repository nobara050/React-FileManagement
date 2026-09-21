import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import DriveBreadcrumbs from '../../components/drive/Breadcrumb/DriveBreadcrumbs';
import { driveApi } from '../../api/drive.api';

export default function TrashPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('searchTerm') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [view, setView] = useState('list');

  // Permanent delete modals
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [itemToDeleteForever, setItemToDeleteForever] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeletedItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        pageNumber: 1,
        pageSize: 100,
      };
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      const data = await driveApi.listDeletedItems(params);
      setItems(data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load trash items from server.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchDeletedItems();
  }, [fetchDeletedItems]);

  const handleRestore = async (item) => {
    setRestoringId(item.id);
    setError('');
    try {
      await driveApi.recoverDriveItem(item.id);
      const typeLabel = item.itemType === 2 ? 'Folder' : 'File';
      setNotification(`${typeLabel} "${item.name}" restored successfully.`);
      await fetchDeletedItems();
    } catch (err) {
      setError(err.message || `Failed to restore "${item.name}". Parent folder might be in Trash or a duplicate name exists.`);
    } finally {
      setRestoringId(null);
    }
  };

  const handleEmptyTrash = async () => {
    setActionLoading(true);
    try {
      await driveApi.emptyTrash();
      setNotification('Trash emptied successfully.');
      setEmptyTrashOpen(false);
      await fetchDeletedItems();
    } catch (err) {
      setError(err.message || 'Failed to empty trash.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDelete = async () => {
    if (!itemToDeleteForever) return;
    setActionLoading(true);
    try {
      await driveApi.hardDeleteTrashItem(itemToDeleteForever.id);
      setNotification(`Permanently deleted "${itemToDeleteForever.name}".`);
      setItemToDeleteForever(null);
      await fetchDeletedItems();
    } catch (err) {
      setError(err.message || 'Failed to permanently delete item.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ height: '100%' }}>
      {/* Breadcrumb showing "Trash" */}
      <DriveBreadcrumbs path={[]} scope="trash" />

      {/* Retention notice alert */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{
          mb: 3,
          borderRadius: 2,
          fontSize: '0.85rem',
          bgcolor: 'action.hover',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
          '& .MuiAlert-icon': { color: 'primary.main' },
        }}
      >
        Items in Trash are automatically deleted forever after 30 days by the system background service.
      </Alert>

      {/* Toolbar */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {items.length} {items.length === 1 ? 'item' : 'items'} in trash
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchDeletedItems}
            disabled={loading}
            sx={{ textTransform: 'none', ml: 1 }}
          >
            Refresh
          </Button>

          {items.length > 0 && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteSweepIcon />}
              onClick={() => setEmptyTrashOpen(true)}
              sx={{ textTransform: 'none', ml: 1, borderRadius: 2 }}
            >
              Empty trash
            </Button>
          )}
        </Box>

        {/* View Switcher */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, nextView) => nextView && setView(nextView)}
          aria-label="view switcher"
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

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            borderColor: 'divider',
          }}
        >
          <DeleteSweepIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Trash is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
            {searchTerm
              ? `No deleted items match "${searchTerm}".`
              : 'Items you delete will be moved here and kept for 30 days before permanent deletion.'}
          </Typography>
        </Paper>
      ) : view === 'list' ? (
        /* List View */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="trash items table">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>Deleted Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Size</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const isFolder = item.itemType === 2;
                const isRestoring = restoringId === item.id;

                return (
                  <TableRow key={item.id} hover>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {isFolder ? (
                          <FolderIcon sx={{ color: 'text.secondary' }} />
                        ) : (
                          <InsertDriveFileIcon sx={{ color: 'primary.main' }} />
                        )}
                        <Typography variant="body2" fontWeight="500" noWrap sx={{ maxWidth: { xs: 180, sm: 260 } }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary">
                        {isFolder ? 'Folder' : 'File'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {isFolder ? '—' : `${(item.size / 1024).toFixed(1)} KB`}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={isRestoring ? <CircularProgress size={14} color="inherit" /> : <RestoreFromTrashIcon />}
                          onClick={() => handleRestore(item)}
                          disabled={isRestoring}
                          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 500 }}
                        >
                          Restore
                        </Button>

                        <Tooltip title="Delete forever">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setItemToDeleteForever(item)}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* Grid View */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {items.map((item) => {
            const isFolder = item.itemType === 2;
            const isRestoring = restoringId === item.id;

            return (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    {isFolder ? (
                      <FolderIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                    ) : (
                      <InsertDriveFileIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                    )}
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold" noWrap title={item.name}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {isFolder ? 'Folder' : `${(item.size / 1024).toFixed(1)} KB`}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    Deleted: {formatDate(item.updatedAt || item.createdAt)}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={isRestoring ? <CircularProgress size={14} color="inherit" /> : <RestoreFromTrashIcon />}
                      onClick={() => handleRestore(item)}
                      disabled={isRestoring}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Restore
                    </Button>

                    <Tooltip title="Delete forever">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setItemToDeleteForever(item)}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Empty Trash Confirmation Modal */}
      <Dialog
        open={emptyTrashOpen}
        onClose={() => !actionLoading && setEmptyTrashOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold" color="error.main">Empty Trash?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            All items in your Trash will be permanently deleted and cannot be recovered.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmptyTrashOpen(false)} disabled={actionLoading} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleEmptyTrash}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepIcon />}
          >
            Empty Trash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Forever Single Item Modal */}
      <Dialog
        open={Boolean(itemToDeleteForever)}
        onClose={() => !actionLoading && setItemToDeleteForever(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle fontWeight="bold" color="error.main">Delete forever?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            "{itemToDeleteForever?.name}" will be deleted forever and you won't be able to restore it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItemToDeleteForever(null)} disabled={actionLoading} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleHardDelete}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
          >
            Delete Forever
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
