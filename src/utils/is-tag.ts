import { ReminderGroup, ReminderGroups } from 'types';

export default function isDefaultReminderGroup(
  reminderGroup: string
): reminderGroup is ReminderGroup {
  return ReminderGroups.includes(reminderGroup as ReminderGroup);
}
