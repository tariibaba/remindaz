import { ReminderList, ReminderLists } from 'types';

export default function isDefaultReminderGroup(
  reminderGroup: string
): reminderGroup is ReminderList {
  return ReminderLists.includes(reminderGroup as ReminderList);
}
