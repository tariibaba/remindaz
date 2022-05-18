import {
  addDays,
  differenceInMinutes,
  addWeeks,
  addMonths,
  addYears,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  differenceInDays,
  nextDay,
  startOfMinute,
} from 'date-fns';
import { Reminder } from 'types';

export function isPast(reminder: Reminder): boolean {
  return startOfMinute(reminder.remindTime) <= startOfMinute(new Date());
}

export function isDue(reminder: Reminder): boolean {
  return !reminder.stopped && isPast(reminder);
}

export function isSnoozeDue(reminder: Reminder): boolean {
  return reminder.snoozeRemindTime
    ? differenceInMinutes(reminder.snoozeRemindTime, new Date()) < 0
    : false;
}

export function getNextDay(reminder: Reminder): Date {
  const dayRepeat = reminder.dayRepeat;
  const today = new Date();
  const add = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    year: addYears,
  }[dayRepeat?.unit!];
  let nextDay = reminder.remindTime;
  do {
    nextDay = add(nextDay, dayRepeat?.num!);
  } while (differenceInDays(nextDay, today) < 0);
  nextDay = setHours(nextDay, getHours(reminder.startTime));
  nextDay = setMinutes(nextDay, getMinutes(reminder.startTime));
  return nextDay;
}

export function isRecurring(reminder: Reminder): boolean {
  return Boolean(reminder.dayRepeat || reminder.timeRepeat);
}
