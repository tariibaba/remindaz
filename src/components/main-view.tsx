import {
  AccessAlarm,
  CalendarToday,
  Delete,
  Sync as SyncIcon,
  Alarm as AlarmIcon,
  Search as SearchIcon,
  MoreVert,
  WatchLater,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { differenceInDays, format, isSameDay, startOfDay } from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext, useRef, useState } from 'react';
import isDefaultReminderGroup from 'utils/is-tag';
import { AppStateContext } from '../context';
import { Reminder, ReminderList } from '../types';
import ReminderListItem from './reminder-list-item';
import ReminderListByDate from './reminder-list-by-date';
import ReminderListGroup from './reminder-list-group';
import ReminderMoreMenu from './reminder-more-menu';

const MainView = observer(() => {
  const state = useContext(AppStateContext)!;
  const reminders = state.reminderIds.map((id) => state.allReminders[id]);

  let remindersToShow: Reminder[] = [];
  const selectedList = state.selectedDefaultList;
  const selectedTag = state.selectedTag;

  if (selectedList) {
    switch (selectedList) {
      case 'active':
        remindersToShow = reminders.filter((reminder) => !reminder.stopped);
        break;
      case 'stopped':
        remindersToShow = reminders.filter((reminder) => reminder.stopped);
        break;
      case 'all':
        remindersToShow = reminders;
        break;
    }
  } else if (selectedTag) {
    remindersToShow = reminders.filter((reminder) =>
      reminder.tags.includes(selectedTag)
    );
  }

  const trimmedQuery = state.query.toLowerCase().trim();
  const queryWords = trimmedQuery && trimmedQuery.split(' ');
  const isQuery = Boolean(queryWords);
  if (queryWords) {
    remindersToShow = remindersToShow.filter((reminder) => {
      const titleWords = reminder.title.toLowerCase().split(' ');
      return queryWords.every((queryWord) => {
        return titleWords.some(
          (titleWord) => titleWord.search(queryWord) !== -1
        );
      });
    });
  }

  const list: React.ReactNode = (
    <List>
      {remindersToShow.map((reminder) => {
        return <ReminderListItem key={reminder.id} id={reminder.id} />;
      })}
    </List>
  );

  const stoppedInGroup = remindersToShow.filter((reminder) => reminder.stopped);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        scrollbarGutter: 'stable',
      }}
    >
      {remindersToShow.length > 0 ? (
        isQuery ? (
          list
        ) : state.sortMode ? (
          ['all', 'active'].includes(selectedList!) || selectedTag ? (
            <React.Fragment key={state.selectedList}>
              <ReminderListByDate reminders={remindersToShow} />
              {stoppedInGroup.length > 0 && (
                <ReminderListGroup
                  groupName="Stopped"
                  reminders={stoppedInGroup}
                />
              )}
            </React.Fragment>
          ) : selectedList === 'stopped' ? (
            list
          ) : undefined
        ) : (
          list
        )
      ) : (
        <div
          style={{
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#c0c0c0',
          }}
        >
          {queryWords ? (
            <>
              <SearchIcon style={{ width: '100px', height: '100px' }} />
              <Typography>No search results found</Typography>
            </>
          ) : (
            <>
              <AlarmIcon style={{ width: '100px', height: '100px' }} />
              <Typography>Create reminders to receive notifications</Typography>
            </>
          )}
        </div>
      )}
      <ReminderMoreMenu />
    </div>
  );
});

export default MainView;
