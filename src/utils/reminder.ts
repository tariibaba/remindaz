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
} from 'date-fns';
import { Reminder } from 'types';

export function isPast(reminder: Reminder): boolean {
  return differenceInMinutes(reminder.remindTime, new Date()) < 0;
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
  const remindTime = reminder.remindTime;
  const dayRepeat = reminder.dayRepeat;
  const add = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    year: addYears,
  }[dayRepeat?.unit!];
  let nextDay = add(remindTime, dayRepeat?.num!);
  nextDay = setHours(nextDay, getHours(reminder.startTime));
  nextDay = setMinutes(nextDay, getMinutes(reminder.startTime));
  return nextDay;
}
