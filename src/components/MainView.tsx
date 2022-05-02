import {
  AccessAlarm,
  CalendarToday,
  Delete,
  EventRepeat,
  Refresh,
} from '@mui/icons-material';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { differenceInDays, format, startOfDay } from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';
import isDefaultReminderGroup from 'utils/is-tag';
import { AppStateContext } from '../context';
import { Reminder, ReminderGroup } from '../types';
import getReadableDay from '../utils/readable-date';
import * as readableDay from '../utils/readable-day';
import * as readableSecond from '../utils/readable-second';

const MainView = observer(() => {
  const state = useContext(AppStateContext)!;
  const reminders = state.reminderIds.map((id) => state.allReminders[id]);

  let remindersToShow: Reminder[] = [];
  const selectedGroup = state.selectedGroup;
  const now = new Date();
  if (isDefaultReminderGroup(selectedGroup)) {
    const today = startOfDay(now);
    switch (selectedGroup) {
      case 'overdue':
        remindersToShow = reminders.filter(
          (reminder) => startOfDay(reminder.remindTime) < startOfDay(now)
        );
        break;
      case 'today':
        remindersToShow = reminders.filter(
          (reminder) => startOfDay(reminder.remindTime) === startOfDay(now)
        );
        break;
      case 'all':
        remindersToShow = reminders;
        break;
      case 'tomorrow':
        remindersToShow = reminders.filter(
          (reminder) =>
            differenceInDays(startOfDay(reminder.remindTime), today) === 1
        );
        break;
      case 'later':
        remindersToShow = reminders.filter(
          (reminder) =>
            differenceInDays(startOfDay(reminder.remindTime), today) > 1
        );
        break;
    }
  } else {
    remindersToShow = reminders.filter((reminder) =>
      reminder.tags.includes(selectedGroup)
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        scrollbarGutter: 'stable',
      }}
    >
      <List>
        {remindersToShow.map((reminder) => {
          const id = reminder.id;
          return (
            <ListItem key={id}>
              <ListItemButton
                className="reminder-list-item"
                sx={{
                  border: '1px solid #c0c0c0',
                  borderRadius: '5px',
                  boxShadow: reminder.reminded ? 0 : 2,
                  margin: '10px',
                  boxSizing: 'border-box',
                  width: '90%',
                  backgroundColor: reminder.reminded ? '#e0e0e0' : 'white',
                  opacity: reminder.reminded ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'row',
                  '& .MuiTypography-root': {
                    fontWeight: 'normal',
                  },
                }}
                onClick={(event) => {
                  state.toggleSidebarReminderInfo(id);
                }}
              >
                <div>
                  <ListItemText sx={{ fontWeight: 'normal !important' }}>
                    {reminder.title}
                  </ListItemText>
                  <div style={{ flexDirection: 'row', display: 'flex' }}>
                    <Chip
                      label={getReadableDay(reminder.remindTime)}
                      icon={<CalendarToday />}
                    />
                    {reminder.dayRepeat && (
                      <Chip
                        label={readableDay.getString(reminder.dayRepeat!)}
                        icon={<EventRepeat />}
                        sx={{ marginLeft: '8px' }}
                      />
                    )}
                    <Chip
                      label={format(reminder.remindTime, 'h:mm a')}
                      icon={<AccessAlarm />}
                      sx={{ marginLeft: '8px' }}
                    />
                    {reminder.timeRepeat && (
                      <Chip
                        label={readableSecond.getString(reminder.timeRepeat!)}
                        sx={{ marginLeft: '8px' }}
                        icon={
                          <div style={{ position: 'relative', marginTop: 0 }}>
                            <AccessAlarm />
                            <div
                              style={{
                                position: 'absolute',
                                left: '-10%',
                                bottom: '5%',
                                height: 15,
                                width: 15,
                                backgroundColor: '#ebebeb',
                                borderRadius: '50%',
                              }}
                            >
                              <Refresh
                                style={{ height: '100%', width: '100%' }}
                              />
                            </div>
                          </div>
                        }
                      />
                    )}
                    {reminder.tags.map((tag) => (
                      <Chip label={tag} style={{ marginLeft: '8px' }} />
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation();
                      state.deleteReminder(id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </div>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
});

export default MainView;
