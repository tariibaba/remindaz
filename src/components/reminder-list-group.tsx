import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import React, { useState } from 'react';
import { Reminder } from 'types';
import ReminderListItem from './reminder-list-item';

type ReminderListGroupProps = {
  groupName: string;
  reminders: Reminder[];
  open?: boolean;
};

const ReminderListGroup = (props: ReminderListGroupProps) => {
  const [open, setOpen] = useState<boolean>(
    props.open === undefined ? true : props.open
  );
  const { groupName, reminders } = props;

  return (
    <ListItem style={{ display: 'flex', flexDirection: 'column' }}>
      {' '}
      <ListItemButton
        onClick={() => setOpen(!open)}
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
};

export default ReminderListGroup;
