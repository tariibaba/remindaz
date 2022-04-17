import { PhotoSizeSelectSmall } from '@mui/icons-material';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import React from 'react';
import { ipcRenderer } from 'electron';

function startMiniMode() {
  ipcRenderer.invoke('mini-mode-start');
}

const AppToolbar = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar color="white" sx={{ display: 'flex', flexDirection: 'row' }}>
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
