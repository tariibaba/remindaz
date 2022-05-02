import {
  Menu as MenuIcon,
  PhotoSizeSelectSmall,
  Search as SearchIcon,
} from '@mui/icons-material';
import { AppBar, Toolbar, IconButton, InputBase } from '@mui/material';
import React, { useContext, useState } from 'react';
import { ipcRenderer } from 'electron';
import SearchBar from './SearchBar';
import { AppStateContext } from '../context';

function startMiniMode() {
  ipcRenderer.invoke('mini-mode-start');
}

type AppToolbarProps = {
  onSidebarOpen: () => void;
};

const AppToolbar = (props: AppToolbarProps) => {
  const { onSidebarOpen } = props;
  const state = useContext(AppStateContext)!;

  const [query, setQuery] = useState<string>('');

  return (
    <>
      <AppBar position="sticky">
        <Toolbar color="white" sx={{ display: 'flex', flexDirection: 'row' }}>
          <IconButton
            onClick={() => onSidebarOpen()}
            color="inherit"
            sx={{ display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <SearchBar
            query={query}
            onChange={(newQuery) => setQuery(newQuery)}
            onSearch={() => state.changeQuery(query!)}
          />
          <IconButton
            onClick={() => startMiniMode()}
            color="inherit"
            sx={{ marginLeft: 'auto' }}
          >
            <PhotoSizeSelectSmall />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default AppToolbar;
