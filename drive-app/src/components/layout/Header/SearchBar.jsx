import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('searchTerm') || '';

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams((prev) => {
        prev.set('searchTerm', value);
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete('searchTerm');
        return prev;
      });
    }
  };

  const handleClear = () => {
    setSearchParams((prev) => {
      prev.delete('searchTerm');
      return prev;
    });
  };

  return (
    <Paper
      component="form"
      onSubmit={(e) => e.preventDefault()}
      elevation={0}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 720,
        bgcolor: '#f1f3f4', // Google Drive search bar grey
        borderRadius: 8,
        transition: 'background-color 0.15s, box-shadow 0.15s',
        '&:focus-within': {
          bgcolor: '#ffffff',
          boxShadow: '0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73,0.15)',
        },
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search" disabled>
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search in Drive"
        inputProps={{ 'aria-label': 'search in drive' }}
        value={query}
        onChange={handleSearchChange}
      />
      {query && (
        <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
          <ClearIcon />
        </IconButton>
      )}
    </Paper>
  );
}
