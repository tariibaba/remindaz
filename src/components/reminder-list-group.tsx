import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { AppStateContext } from 'context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { Reminder, ReminderListGroup as ReminderListGroupType } from 'types';
import ReminderListItem from './reminder-list-item';

type ReminderListGroupProps = {
  groupName: ReminderListGroupType;
  reminders: Reminder[];
};

const ReminderListGroup = observer((props: ReminderListGroupProps) => {
  const { groupName, reminders } = props;
  const state = useContext(AppStateContext)!;
  const open = state.isReminderListGroupOpen(groupName);
  const handleToggleReminderListGroupOpen = () => {
    state.toggleReminderListGroupOpen(groupName);
  };

  return (
    <ListItem style={{ display: 'flex', flexDirection: 'column' }}>
      {' '}
      <ListItemButton
        onClick={handleToggleReminderListGroupOpen}
        style={{
          alignSelf: 'flex-start',
          width: '100%',
        }}
      >
        <ListItemText>{groupName}</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} style={{ width: '100%' }}>
        <List>
          {reminders.map((reminder) => (
            <ReminderListItem key={reminder.id} id={reminder.id} />
          ))}
        </List>
      </Collapse>
    </ListItem>
  );
});

export default ReminderListGroup;
