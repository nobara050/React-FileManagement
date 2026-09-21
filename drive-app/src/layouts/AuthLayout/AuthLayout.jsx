import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e9f1fb 0%, #f1f3f4 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
            <CloudQueueIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" component="h1" fontWeight="bold" color="primary.main">
              Drive App
            </Typography>
          </Box>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
