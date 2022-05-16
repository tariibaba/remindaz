import { differenceInDays, isBefore } from 'date-fns';
import { Reminder } from 'types';

export function isOverdue(reminder: Reminder): boolean {
  return isBefore(reminder.remindTime, new Date());
}
