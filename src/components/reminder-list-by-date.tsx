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
import { Reminder, ReminderGroup } from '../types';
import getReadableDay from '../utils/readable-date';
import * as readableDay from '../utils/readable-day';
import * as readableSecond from '../utils/readable-second';
import { makeStyles } from 'make-styles';
import escapeStringRegexp from 'escape-string-regexp';
import mergeRanges from 'utils/merge-ranges';
import { red } from '@mui/material/colors';
import clsx from 'clsx';
import {
  isDue,
  isLater,
  isNextWeek,
  isPast,
  isToday as isReminderToday,
  isToday,
  isTomorrow,
} from 'utils/reminder';
import ReminderListItem from './reminder-list-item';
import ReminderListGroup from './reminder-list-group';

type ReminderListByDateProps = {
  reminders: Reminder[];
};

const ReminderListByDate = (props: ReminderListByDateProps) => {
  const reminders = props.reminders.sort(
    (reminder1, reminder2) =>
      reminder1.remindTime.getTime() - reminder2.remindTime.getTime()
  );
  const overdue = reminders.filter((reminder) => isDue(reminder));
  const today = reminders.filter(
    (reminder) => !isPast(reminder) && isToday(reminder)
  );
  const tomorrow = reminders.filter((reminder) => isTomorrow(reminder));
  const nextWeek = reminders.filter((reminder) => isNextWeek(reminder));
  const later = reminders.filter((reminder) => isLater(reminder));
  const dayGroups: Record<string, Reminder[]> = {
    Overdue: overdue,
    'Later today': today,
    Tomorrow: tomorrow,
    'Next week': nextWeek,
    Later: later,
  };

  return (
    <>
      {Object.keys(dayGroups).map((groupName) => {
        const groupReminders = dayGroups[groupName];
        return groupReminders.length > 0 ? (
          <ReminderListGroup
            key={groupName}
            groupName={groupName}
            reminders={groupReminders}
          />
        ) : (
          <></>
        );
      })}
    </>
  );
};

export default ReminderListByDate;
