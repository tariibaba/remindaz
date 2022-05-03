import {
  Menu as MenuIcon,
  PhotoSizeSelectSmall,
  Search as SearchIcon,
} from '@mui/icons-material';
import { AppBar, Toolbar, IconButton, InputBase } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
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
  const [willSearch, setWillSearch] = useState<boolean>(false);

  useEffect(() => {
    if (willSearch) {
      state.changeQuery(query);
      setWillSearch(false);
    }
  }, [query]);

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
            onSearch={() => setWillSearch(true)}
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
