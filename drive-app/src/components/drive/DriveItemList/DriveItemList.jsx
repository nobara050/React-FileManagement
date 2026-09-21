import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';

import DriveItemRow from './DriveItemRow';
import EmptyState from '../../common/EmptyState/EmptyState';

export default function DriveItemList({ items = [], onDoubleClick, onMenuClick, onContextMenu, getHideMenu }) {
  if (items.length === 0) {
    return <EmptyState title="No items in this folder" description="Drag & drop files or click New to get started." />;
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <Table sx={{ minWidth: 650 }} aria-label="drive items table" size="medium">
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }}>Owner</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>Last modified</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>File size</TableCell>
            <TableCell align="right" sx={{ width: 50 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <DriveItemRow
              key={item.id}
              item={item}
              onDoubleClick={onDoubleClick}
              onMenuClick={onMenuClick}
              onContextMenu={onContextMenu}
              hideMenu={getHideMenu ? getHideMenu(item) : false}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
