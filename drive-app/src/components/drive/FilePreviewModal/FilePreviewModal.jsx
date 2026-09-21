import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

import { driveApi } from '../../../api/drive.api';

// ---------------------------------------------------------------------------
function getPreviewKind(mimeType, fileName) {
  const m = (mimeType || '').toLowerCase();
  const ext = (fileName || '').split('.').pop().toLowerCase();

  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
  const pdfExts = ['pdf'];
  const textExts = [
    'txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass',
    'xml', 'csv', 'log', 'yaml', 'yml', 'py', 'cs', 'java', 'cpp', 'c', 'h', 'hpp',
    'sh', 'bash', 'sql', 'env', 'ini', 'toml', 'dockerfile', 'gitignore'
  ];

  if (m.startsWith('image/') || imageExts.includes(ext)) return 'image';
  if (m === 'application/pdf' || pdfExts.includes(ext)) return 'pdf';
  if (
    m.startsWith('text/') ||
    m === 'application/json' ||
    m === 'application/javascript' ||
    m === 'application/xml' ||
    m === 'application/x-yaml' ||
    m === 'text/markdown' ||
    textExts.includes(ext)
  ) {
    return 'text';
  }
  return 'unsupported';
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function ImagePreview({ url, name }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 6 }}>
        <BrokenImageIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography color="text.secondary">Could not load image.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <Box
        component="img"
        src={url}
        alt={name}
        onError={() => setErrored(true)}
        sx={{
          maxWidth: '100%',
          maxHeight: '70vh',
          objectFit: 'contain',
          borderRadius: 2,
          boxShadow: 3,
        }}
      />
    </Box>
  );
}

function PdfPreview({ url }) {
  return (
    <Box
      component="iframe"
      src={url}
      title="PDF preview"
      sx={{
        width: '100%',
        height: '72vh',
        border: 'none',
        borderRadius: 1,
      }}
    />
  );
}

function TextPreview({ url }) {
  const [text, setText] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.text())
      .then((t) => { if (!cancelled) setText(t); })
      .catch(() => { if (!cancelled) setFetchError(true); });
    return () => { cancelled = true; };
  }, [url]);

  if (fetchError) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Could not load text content.</Typography>
      </Box>
    );
  }

  if (text === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: '65vh',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        fontFamily: 'monospace',
        bgcolor: 'background.default',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
    </Box>
  );
}

function UnsupportedPreview({ item, onDownload }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 6,
      }}
    >
      <InsertDriveFileIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
      <Typography variant="subtitle1" fontWeight={600}>
        Preview not available
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        This file type ({item?.mimeType || 'unknown'}) cannot be previewed in the browser.
      </Typography>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => onDownload(item)}
        sx={{ mt: 1 }}
      >
        Download instead
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FilePreviewModal({ open, onClose, item }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const kind = item ? getPreviewKind(item.mimeType, item.name) : 'unsupported';

  const fetchPreviewUrl = useCallback(async () => {
    if (!item) return;
    setLoading(true);
    setError('');
    setPreviewUrl(null);
    try {
      const { url } = await driveApi.getPreviewUrl(item.id);
      setPreviewUrl(url);
    } catch (err) {
      setError(err.message || 'Failed to load preview.');
    } finally {
      setLoading(false);
    }
  }, [item]);

  useEffect(() => {
    if (open && item) {
      fetchPreviewUrl();
    }
    // Reset when closed
    if (!open) {
      setPreviewUrl(null);
      setError('');
    }
  }, [open, item, fetchPreviewUrl]);

  const handleDownload = async (fileItem) => {
    try {
      await driveApi.downloadFile(fileItem);
    } catch {
      // swallow — user can try again
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pr: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <InsertDriveFileIcon color="primary" />
        <Typography
          variant="subtitle1"
          component="span"
          fontWeight={600}
          noWrap
          sx={{ flexGrow: 1, minWidth: 0 }}
          title={item?.name}
        >
          {item?.name}
        </Typography>

        {/* Download shortcut */}
        <Tooltip title="Download">
          <IconButton
            size="small"
            onClick={() => handleDownload(item)}
            disabled={!item}
            aria-label="download file"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Close */}
        <IconButton size="small" onClick={onClose} aria-label="close preview">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          p: kind === 'pdf' ? 0 : 3,
          bgcolor: kind === 'image' ? '#111' : 'background.paper',
          minHeight: 200,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="outlined" size="small" onClick={fetchPreviewUrl}>
              Retry
            </Button>
          </Box>
        )}

        {!loading && !error && previewUrl && (
          <>
            {kind === 'image' && <ImagePreview url={previewUrl} name={item?.name} />}
            {kind === 'pdf' && <PdfPreview url={previewUrl} />}
            {kind === 'text' && <TextPreview url={previewUrl} />}
          </>
        )}

        {!loading && !error && previewUrl && kind === 'unsupported' && (
          <UnsupportedPreview item={item} onDownload={handleDownload} />
        )}

        {!loading && !error && !previewUrl && kind === 'unsupported' && (
          <UnsupportedPreview item={item} onDownload={handleDownload} />
        )}
      </DialogContent>

      {/* Footer */}
      {kind !== 'pdf' && (
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            {item?.mimeType && `${item.mimeType}`}
            {item?.size && ` · ${(item.size / 1024).toFixed(1)} KB`}
          </Typography>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
