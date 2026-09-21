import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function CreateFolderModal({ open, onClose, onSubmit }) {
  const [folderName, setFolderName] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (open) {
      setFolderName('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim() && onSubmit) {
      onSubmit(folderName.trim());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 }
        }
      }}
    >
      <DialogTitle fontWeight="bold">New folder</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder name"
            type="text"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!folderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
