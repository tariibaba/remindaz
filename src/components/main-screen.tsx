import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import LeftSidebar from './LeftSidebar';
import AppToolbar from './main-screen-toolbar';
import MainView from './main-view';
import isDefaultReminderGroup from 'utils/is-tag';
import CreateReminderTextField from './CreateReminderTextField';
import ReminderInfoSidebar from './ReminderInfoSidebar';
import { AppStateContext } from 'context';
import { Divider } from '@mui/material';

const MainScreen = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const state = useContext(AppStateContext)!;
  const showTextField: boolean =
    ['all', 'active'].includes(state.selectedDefaultList!) ||
    Boolean(state.selectedTag);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        overflowY: 'hidden',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', flex: 1 }}>
        <LeftSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <AppToolbar onSidebarOpen={() => setSidebarOpen(true)} />
          <MainView />

          <div style={{ visibility: showTextField ? 'visible' : 'hidden' }}>
            <CreateReminderTextField />
          </div>
        </div>
      </div>
      <ReminderInfoSidebar />
    </div>
  );
};

export default observer(MainScreen);
