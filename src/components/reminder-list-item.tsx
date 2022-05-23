import {
  AccessAlarm,
  CalendarToday,
  Sync as SyncIcon,
  MoreVert,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';
import getReadableDay from '../utils/readable-date';
import { red } from '@mui/material/colors';
import clsx from 'clsx';
import { makeStyles } from 'make-styles';
import { AppStateContext } from 'context';
import { Reminder } from 'types';
import { isDue } from 'utils/reminder';
import escapeStringRegexp from 'escape-string-regexp';
import mergeRanges from 'utils/merge-ranges';
import wrapInHtmlTag from 'utils/wrap-in-html-tag';
import { Tag } from 'mdi-material-ui';

const useStyles = makeStyles()((theme) => ({
  deleteButton: {
    visibility: 'hidden',
  },
  reminderListItem: {
    border: '1px solid #c0c0c0',
    borderRadius: '5px',
    boxShadow: theme.shadows[2],
    margin: '10px',
    boxSizing: 'border-box',
    width: '90%',
    backgroundColor: 'white',
    opacity: 1,
    display: 'flex',
    flexDirection: 'row',
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
  },
  reminderStopped: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
    boxShadow: 'none',
  },
}));

type ReminderListItemProps = {
  id: string;
};

const ReminderListItem = observer((props: ReminderListItemProps) => {
  const { id } = props;
  const { classes } = useStyles();
  const state = useContext(AppStateContext)!;
  const reminder = state.allReminders[id];

  let titleHtml: string = reminder.title;
  const trimmedQuery = state.query.toLowerCase().trim();
  const queryWords = trimmedQuery && trimmedQuery.split(' ');
  if (queryWords) {
    const unjoinedSpans: [number, number][] = Array.from(
      new Set(queryWords)
    ).reduce((arr, item) => {
      const indexes = Array.from(
        reminder.title.matchAll(new RegExp(escapeStringRegexp(item), 'gi'))
      );
      return arr.concat(
        indexes.map(({ index }) => {
          return [index as number, index! + item.length];
        })
      );
    }, [] as [number, number][]);
    const joinedSpans: [number, number][] = mergeRanges(unjoinedSpans);

    titleHtml = wrapInHtmlTag({
      text: reminder.title,
      ranges: joinedSpans,
      startTag: '<span style="background-color:#3FD2E2">',
      endTag: '</span>',
    });
  }

  const handleListItemButtonClick = (event, reminder: Reminder) => {
    const { id } = reminder;
    const okayButton = document.querySelector(
      `.reminder-${id} .toggle-stopped`
    );
    const moreVertButton = document.querySelector(
      `.reminder-${id} .more-vert-btn`
    );
    const targetNode = event.target as Node;
    if (
      !(
        okayButton?.contains(targetNode) || moreVertButton?.contains(targetNode)
      )
    ) {
      state.toggleSidebarReminderInfo(id);
    }
  };

  const handleMoreVertClick = (event) => {
    state.openReminderMore(reminder.id, event.currentTarget);
  };

  const toggleStopped = () => {
    if (reminder.stopped) state.continueReminder(reminder.id);
    else state.stopReminder(reminder.id);
  };

  const due = isDue(reminder);

  return (
    <>
      <ListItem key={id}>
        <ListItemButton
          className={clsx(
            'reminder-list-item',
            `reminder-${id}`,
            classes.reminderListItem,
            reminder.stopped && classes.reminderStopped
          )}
          onClick={(event) => handleListItemButtonClick(event, reminder)}
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
                style={due ? { backgroundColor: red[400], color: 'white' } : {}}
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
                    <CalendarToday style={due ? { color: 'white' } : {}} />
                  </div>
                }
              />
              <Chip
                style={due ? { backgroundColor: red[400], color: 'white' } : {}}
                label={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {format(reminder.remindTime, 'h:mm a')}
                    <span>{reminder.timeRepeat && <SyncIcon />}</span>
                  </div>
                }
                icon={<AccessAlarm style={due ? { color: 'white' } : {}} />}
                sx={{ marginLeft: '8px' }}
              />
              {reminder.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  style={{ marginLeft: '8px' }}
                  icon={<Tag />}
                />
              ))}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            <Button
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => toggleStopped()}
              className="toggle-stopped"
            >
              {reminder.stopped ? 'Continue' : 'Stop'}
            </Button>
            <IconButton onClick={handleMoreVertClick} className="more-vert-btn">
              <MoreVert />
            </IconButton>
          </div>
        </ListItemButton>
      </ListItem>
    </>
  );
});

export default ReminderListItem;
