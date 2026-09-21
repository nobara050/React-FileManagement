import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import DriveItemCard from '../DriveItemCard/DriveItemCard';
import EmptyState from '../../common/EmptyState/EmptyState';

export default function DriveItemGrid({ items = [], onDoubleClick, onMenuClick, onContextMenu, getHideMenu }) {
  if (items.length === 0) {
    return <EmptyState title="No items in this folder" description="Drag & drop files or click New to get started." />;
  }

  const folders = items.filter((item) => item.itemType === 2);
  const files = items.filter((item) => item.itemType === 1);

  return (
    <Box>
      {/* Folders Section */}
      {folders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Folders
          </Typography>
          <Grid container spacing={2}>
            {folders.map((folder) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={folder.id}>
                <DriveItemCard
                  item={folder}
                  onDoubleClick={onDoubleClick}
                  onMenuClick={onMenuClick}
                  onContextMenu={onContextMenu}
                  hideMenu={getHideMenu ? getHideMenu(folder) : false}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Files
          </Typography>
          <Grid container spacing={2}>
            {files.map((file) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                <DriveItemCard
                  item={file}
                  onDoubleClick={onDoubleClick}
                  onMenuClick={onMenuClick}
                  onContextMenu={onContextMenu}
                  hideMenu={getHideMenu ? getHideMenu(file) : false}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
