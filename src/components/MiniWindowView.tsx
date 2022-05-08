import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import './MiniWindowView.css';
import { AppStateContext } from '../context';
import { observer } from 'mobx-react';
import {
  Fullscreen,
  RectangleOutlined,
  Maximize,
  Alarm as AlarmIcon,
} from '@mui/icons-material';
import { ipcRenderer } from 'electron';
import { isToday } from 'date-fns';

function endMiniMode() {
  ipcRenderer.invoke('mini-mode-end');
}

const MiniMode = observer(() => {
  const state = useContext(AppStateContext)!;
  const now = new Date();
  return (
    <div
      className="MiniMode"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 9999,
        }}
      >
        <IconButton onClick={() => endMiniMode()}>
          <RectangleOutlined />
        </IconButton>
      </div>
      {state.reminderIds.length > 0 ? (
        <List>
          {state.reminderIds
            .map((id) => state.allReminders[id])
            .filter(
              (reminder) =>
                !reminder.stopped &&
                (isToday(reminder.remindTime) || reminder.remindTime < now)
            )
            .sort(
              (reminder1, reminder2) =>
                reminder1.remindTime.getTime() - reminder2.remindTime.getTime()
            )
            .map((reminder) => {
              return (
                <ListItem
                  key={reminder.id}
                  sx={{ padding: '0 16px', borderTop: '1px solid #c0c0c0' }}
                >
                  <ListItemText>{reminder.title}</ListItemText>
                </ListItem>
              );
            })}
        </List>
      ) : (
        <div
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#c0c0c0',
            flex: 1,
          }}
        >
          <AlarmIcon style={{ width: '100px', height: '100px' }} />
          <Typography>No reminders</Typography>
        </div>
      )}
    </div>
  );
});

export default MiniMode;
