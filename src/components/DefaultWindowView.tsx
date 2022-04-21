import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import AccessAlarm from '@mui/icons-material/AccessAlarm';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import { AppStateContext } from '../context';
import React from 'react';
import {
  Delete,
  EventRepeat,
  Refresh,
  PhotoSizeSelectSmall,
} from '@mui/icons-material';
import './DefaultWindowView.css';
import CreateReminderTextField from './CreateReminderTextField';
import MainView from './MainView';
import AppToolbar from './AppToolbar';
import ReminderInfoSidebar from './ReminderInfoSidebar';

const Main = () => {
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
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <AppToolbar />
            <MainView />
            <CreateReminderTextField />
          </div>
          <ReminderInfoSidebar />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default observer(Main);
