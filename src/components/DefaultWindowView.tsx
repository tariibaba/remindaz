import { observer } from 'mobx-react';
import { useContext, useState } from 'react';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AppStateContext } from '../context';
import React from 'react';
import './DefaultWindowView.css';
import CreateReminderTextField from './CreateReminderTextField';
import MainView from './MainView';
import AppToolbar from './AppToolbar';
import ReminderInfoSidebar from './ReminderInfoSidebar';
import LeftSidebar from './LeftSidebar';
import { ReminderGroup, ReminderGroups } from 'types';

const Main = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const state = useContext(AppStateContext)!;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="App">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflowY: 'hidden',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flex: 1 }}>
            <LeftSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <AppToolbar onSidebarOpen={() => setSidebarOpen(true)} />
              <MainView />
              {(state.selectedGroup === 'all' ||
                !ReminderGroups.includes(
                  state.selectedGroup as ReminderGroup
                )) && <CreateReminderTextField />}
            </div>
          </div>
          <ReminderInfoSidebar />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default observer(Main);
