export type Reminder = {
  id: string;
  title: string;
  note?: string;
  startDate: Date;
  startTime: Date;
  dayRepeat?: ReadableDays;
  /** Amount of seconds before repeating in the same day. */
  timeRepeat?: ReadableSeconds;
  stopped: boolean;
  remindTime: Date;
  /** Time to remind when user didn't click button to acknowledge reminder. */
  snoozeRemindTime?: Date;
  tags: string[];
  lastReminded?: Date;
};

export type WindowMode = 'default' | 'mini';

export const SecondUnits = ['minute', 'hour'] as const;
export type SecondUnit = typeof SecondUnits[number];
export type ReadableSeconds = { num: number; unit: SecondUnit };

export const DayUnits = ['day', 'week', 'month', 'year'] as const;
export type DayUnit = typeof DayUnits[number];
export type ReadableDays = { num: number; unit: DayUnit };

export const ReminderLists = ['active', 'stopped', 'all'] as const;
export type ReminderList = typeof ReminderLists[number];

export type AppSettings = {
  runAtStartup: boolean;
};

export type SortMode = 'date';

export type ReminderListGroup =
  | 'Overdue'
  | 'Later today'
  | 'Tomorrow'
  | 'Later'
  | 'Stopped';
