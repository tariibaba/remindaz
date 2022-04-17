import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import './MiniWindowView.css';
import { AppStateContext } from '../context';
import { observer } from 'mobx-react';
import { Fullscreen, RectangleOutlined, Maximize } from '@mui/icons-material';
import { ipcRenderer } from 'electron';
import { isToday } from 'date-fns';

function endMiniMode() {
  ipcRenderer.invoke('mini-mode-end');
}

const MiniMode = observer(() => {
  const state = useContext(AppStateContext)!;
  console.log(`reminder count: ${state.reminderIds.length}`);
  const now = new Date();
  return (
    <div className="MiniMode">
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
      <List>
        {state.reminderIds
          .map((id) => state.allReminders[id])
          .filter(
            (reminder) =>
              !reminder.reminded &&
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
    </div>
  );
});

export default MiniMode;
