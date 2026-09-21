import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export default function EmptyState({ title = 'No items found', description = 'This folder is empty.' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        minHeight: 300,
      }}
    >
      <FolderOpenIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" fontWeight="500" gutterBottom color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {description}
      </Typography>
    </Box>
  );
}
