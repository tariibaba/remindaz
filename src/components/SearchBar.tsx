import { Box, InputBase } from '@mui/material';
import React from 'react';
import { Search as SearchIcon } from '@mui/icons-material';

export type SearchBarProps = {
  onSearch: () => void;
  query: string;
  onChange: (newQuery) => void;
};

const SearchBar = (props: SearchBarProps) => {
  const { onSearch, query, onChange } = props;

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch();
    }
  };

  const onInputChange = (event) => {
    onChange(event.target.value);
    onSearch();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '5px',
        boxShadow: 1,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <InputBase
        value={query}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        sx={{ backgroundColor: 'white', width: '100%' }}
        placeholder="Search reminders"
      ></InputBase>
      <SearchIcon sx={{ marginLeft: 'auto', color: 'black' }}></SearchIcon>
    </Box>
  );
};

export default SearchBar;
