import React from 'react';
import { Reminder, ReminderListGroup as ReminderListGroupType } from '../types';
import {
  isDue,
  isLater,
  isLaterThisWeek,
  isNextWeek,
  isPast,
  isToday,
  isTomorrow,
} from 'utils/reminder';
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
  const laterThisWeek = reminders.filter((reminder) =>
    isLaterThisWeek(reminder)
  );
  const dayGroups: Partial<Record<ReminderListGroupType, Reminder[]>> = {
    Overdue: overdue,
    'Later today': today,
    Tomorrow: tomorrow,
    'Next week': nextWeek,
    'Later this week': laterThisWeek,
    Later: later,
  };

  const groupNames: ReminderListGroupType[] = [
    'Overdue',
    'Later today',
    'Tomorrow',
    'Later this week',
    'Next week',
    'Later',
  ];

  return (
    <>
      {groupNames.map((groupName) => {
        const groupReminders = dayGroups[groupName]!;
        return groupReminders.length > 0 ? (
          <ReminderListGroup
            key={groupName}
            groupName={groupName}
            reminders={groupReminders}
          />
        ) : undefined;
      })}
    </>
  );
};

export default ReminderListByDate;
