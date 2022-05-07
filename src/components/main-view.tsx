import {
  AccessAlarm,
  CalendarToday,
  Delete,
  EventRepeat,
  Refresh,
  Check as CheckIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
} from '@mui/material';
import { differenceInDays, format, startOfDay } from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext, useRef } from 'react';
import isDefaultReminderGroup from 'utils/is-tag';
import { AppStateContext } from '../context';
import { Reminder, ReminderGroup } from '../types';
import getReadableDay from '../utils/readable-date';
import * as readableDay from '../utils/readable-day';
import * as readableSecond from '../utils/readable-second';
import { makeStyles } from 'make-styles';
import escapeStringRegexp from 'escape-string-regexp';
import mergeRanges from 'utils/merge-ranges';

const useStyles = makeStyles()((theme) => ({
  deleteButton: {
    visibility: 'hidden',
  },
}));

function insertSpans(str: string, ranges: [number, number][]): string {
  let html = '';
  let spanIndex = 0;
  for (let i = 0; i < str.length; i++) {
    const [spanStart, spanEnd] = ranges[spanIndex];
    if (i === spanStart) {
      html += '<span style="background-color:#3FD2E2">';
    }
    if (i === spanEnd) {
      html += '</span>';
      spanIndex++;
    }
    html += str[i];
    if (spanIndex === ranges.length) {
      html += str.slice(i + 1);
      break;
    }
  }
  return html;
}

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

  const trimmedQuery = state.query.trim();
  const queryWords = trimmedQuery && trimmedQuery.split(' ');
  if (queryWords) {
    remindersToShow = remindersToShow.filter((reminder) => {
      const titleWords = reminder.title.split(' ');
      return queryWords.every((queryWord) => {
        return titleWords.some(
          (titleWord) => titleWord.search(queryWord) !== -1
        );
      });
    });
  }

  const okayButtonRef = useRef<HTMLDivElement>(null);
  const { classes } = useStyles();
  const theme = useTheme();

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
          let titleHtml: string = reminder.title;
          if (queryWords) {
            const unjoinedSpans: [number, number][] = Array.from(
              new Set(queryWords)
            ).reduce((arr, item) => {
              const indexes = Array.from(
                reminder.title.matchAll(
                  new RegExp(escapeStringRegexp(item), 'gi')
                )
              );
              return arr.concat(
                indexes.map(({ index }) => {
                  return [index as number, index! + item.length];
                })
              );
            }, [] as [number, number][]);
            const joinedSpans: [number, number][] = mergeRanges(unjoinedSpans);

            titleHtml = insertSpans(reminder.title, joinedSpans);
          }

          return (
            <ListItem key={id}>
              <ListItemButton
                className={`reminder-list-item reminder-${id}`}
                sx={{
                  border: '1px solid #c0c0c0',
                  borderRadius: '5px',
                  boxShadow: reminder.stopped ? 0 : 2,
                  margin: '10px',
                  boxSizing: 'border-box',
                  width: '90%',
                  backgroundColor: reminder.stopped ? '#e0e0e0' : 'white',
                  opacity: reminder.stopped ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'row',
                  '& .MuiTypography-root': {
                    fontWeight: 'normal',
                  },
                  '&:hover': {
                    '& .toggle-stopped': {
                      visibility: 'visible',
                    },
                    '& .delete-btn': {
                      visibility: 'visible',
                    },
                  },
                  '& .toggle-stopped': {
                    visibility: 'hidden',
                  },
                  '& .delete-btn': {
                    visibility: 'hidden',
                  },
                }}
                onClick={(event) => {
                  const okayButton = document.querySelector(
                    `.reminder-${id} .toggle-stopped`
                  );
                  const deleteButton = document.querySelector(
                    `.reminder-${id} .delete-btn`
                  );
                  const targetNode = event.target as Node;
                  if (
                    !(
                      okayButton?.contains(targetNode) ||
                      deleteButton?.contains(targetNode)
                    )
                  ) {
                    state.toggleSidebarReminderInfo(id);
                  }
                }}
              >
                <div>
                  <ListItemText sx={{ fontWeight: 'normal !important' }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: titleHtml,
                      }}
                    />
                  </ListItemText>
                  <div style={{ flexDirection: 'row', display: 'flex' }}>
                    <Chip
                      label={
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {getReadableDay(reminder.remindTime)}
                          <span>{reminder.dayRepeat && <SyncIcon />}</span>
                        </div>
                      }
                      icon={
                        <div>
                          <CalendarToday />
                        </div>
                      }
                    />
                    <Chip
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {format(reminder.remindTime, 'h:mm a')}
                          <span>{reminder.timeRepeat && <SyncIcon />}</span>
                        </div>
                      }
                      icon={<AccessAlarm />}
                      sx={{ marginLeft: '8px' }}
                    />
                    {reminder.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        style={{ marginLeft: '8px' }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex' }}>
                  {reminder.remindTime.getTime() < new Date().getTime() && (
                    <div className="toggle-stopped" onClick={(event) => {}}>
                      <Button
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) =>
                          reminder.stopped
                            ? state.continueReminder(reminder.id)
                            : state.stopReminder(reminder.id)
                        }
                      >
                        {reminder.stopped ? 'Continue' : 'Stop'}
                      </Button>
                    </div>
                  )}
                  <div className="delete-btn">
                    <IconButton
                      className="delete-btn"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() => state.deleteReminder(id)}
                    >
                      <Delete />
                    </IconButton>
                  </div>
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
