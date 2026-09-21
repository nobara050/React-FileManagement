import React, { useState, useRef, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinearProgress from '@mui/material/LinearProgress';

export default function UploadModal({ open, onClose, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setUploading(false);
    }
  }, [open]);

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    try {
      if (onSubmit) {
        await onSubmit(selectedFile);
      }
    } catch {
      // Error handled by parent page
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose} // Prevent closing during active upload
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 }
        }
      }}
    >
      <DialogTitle fontWeight="bold">Upload file</DialogTitle>
      
      <DialogContent>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Drag & Drop Area */}
        {!selectedFile && !uploading && (
          <Box
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s, border-color 0.15s',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="body1" fontWeight="500">
              Drag & drop file here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              or click to browse from computer
            </Typography>
            <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>
              Max size: 100 MB
            </Typography>
          </Box>
        )}

        {/* Selected file info / progress */}
        {selectedFile && (
          <Box>
            <List>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemIcon>
                  <InsertDriveFileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={selectedFile.name}
                  secondary={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            </List>
            
            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                  Uploading file to Drive...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleUploadSubmit}
          variant="contained"
          disabled={!selectedFile || uploading}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
