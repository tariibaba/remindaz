import { makeAutoObservable, runInAction } from 'mobx';
import { v4 } from 'uuid';
import { Reminder, ReminderGroup, ReminderGroups, AppSettings } from './types';
import { ipcRenderer } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  getDate,
  getMonth,
  getYear,
  isToday,
  setDate,
  setMonth,
  setYear,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  differenceInDays,
} from 'date-fns';
import isDefaultReminderGroup from 'utils/is-tag';
import { isOverdue } from 'utils/reminder';

const dataPath = ipcRenderer.sendSync('getUserDataPath');

const filename =
  process.env.NODE_ENV === 'production' ? 'data.json' : 'dev_data.json';
const filePath = path.join(dataPath, filename);

type AppScreen = 'main' | 'settings';

const defaultSettings: AppSettings = {
  runAtStartup: true,
};

function getNextDay(reminder: Reminder): Date {
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

export class AppState {
  reminderIds: string[] = [];
  allReminders: Record<string, Reminder> = {};
  miniMode?: boolean;
  sidebarReminderInfo?: string;
  sidebarReminderInfoVisible: boolean = false;
  tagNames: string[] = [];
  allTags: Record<string, string[]> = {};
  selectedGroup: string = 'all';
  query: string = '';
  screen: AppScreen = 'main';
  appSettings?: AppSettings;

  constructor() {
    makeAutoObservable(this);
  }

  createReminder(reminder: Omit<Reminder, 'id'>): { id: string } {
    const id = v4();
    runInAction(() => {
      this.reminderIds.push(id);
      this.allReminders[id] = {
        id,
        ...reminder,
        tags: [],
      };
      if (!isDefaultReminderGroup(this.selectedGroup)) {
        this._putTag(id, this.selectedGroup);
      }
    });
    this.saveState();
    this.updateWindowBadge();
    return { id };
  }

  async deleteReminder(reminderId: string): Promise<void> {
    runInAction(() => {
      this.reminderIds = this.reminderIds.filter((id) => id !== reminderId);
      delete this.allReminders[reminderId];
    });
    await this.saveState();
    this.updateWindowBadge();
  }

  async saveState() {
    const data = {
      reminderIds: this.reminderIds,
      allReminders: this.allReminders,
      allTags: this.allTags,
      tagNames: this.tagNames,
      appSettings: this.appSettings,
    };
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString);
  }

  private _putTag(reminderId: string, tag: string): void {
    const reminder = this.allReminders[reminderId];
    reminder.tags.push(tag);
    if (!this.allTags[tag]) {
      this.tagNames.push(tag);
      this.allTags[tag] = [];
    }
    this.allTags[tag].push(reminderId);
  }

  async init() {
    await this.loadState();
    this.startNotificationCheck();
    this.updateWindowBadge();
    ipcRenderer.on('load-window-mode', (event, args) => {
      this.loadWindowMode(args.miniMode);
    });
    ipcRenderer.on('refresh-app-state', () => {
      this.loadState();
    });
    ipcRenderer.invoke('react-load');
  }

  updateWindowBadge() {
    const now = new Date();
    ipcRenderer.send(
      'update-badge',
      this.reminderIds.filter((id) => {
        const reminder = this.allReminders[id];
        return (
          !reminder.stopped &&
          (reminder.remindTime.getTime() < now.getTime() ||
            isToday(reminder.remindTime))
        );
      }).length
    );
  }

  async loadState() {
    const jsonString = (await fs.readFile(filePath)).toString();
    try {
      const data = JSON.parse(jsonString, (key, value) => {
        if (['startDate', 'startTime', 'remindTime'].includes(key)) {
          const date = new Date(value);
          return date;
        }
        return value;
      });
      runInAction(() => {
        this.reminderIds = data.reminderIds;
        this.allReminders = data.allReminders;
        this.tagNames = data.tagNames;
        this.allTags = data.allTags;
        this.appSettings = { ...defaultSettings, ...data.appSettings };
      });
    } catch {
      await this.saveState();
    }
  }

  removeRemindersBeforeToday(): void {
    const now = new Date();
    this.reminderIds = this.reminderIds.filter((reminderId) => {
      const reminder = this.allReminders[reminderId];
      return !(
        reminder.stopped && differenceInDays(reminder.remindTime, now) < 0
      );
    });
    const allReminders: Record<string, Reminder> = {};
    for (let reminderId of this.reminderIds) {
      allReminders[reminderId] = this.allReminders[reminderId];
    }
    this.allReminders = allReminders;
    this.saveState();
  }

  startNotificationCheck() {
    const devInterval = 10000;
    const interval =
      process.env.NODE_ENV === 'production' ? 60000 : devInterval;
    setInterval(() => {
      this.removeRemindersBeforeToday();
      const now = new Date();
      const thisMinute = toNearestMinute(now);
      this.reminderIds
        .map((id) => this.allReminders[id])
        .filter((reminder) => !reminder.stopped)
        .forEach((reminder, index) => {
          const date = toNearestMinute(reminder.remindTime);
          const snoozeRemindTime =
            reminder.snoozeRemindTime &&
            toNearestMinute(new Date(reminder.snoozeRemindTime!));

          const isNormalNotification =
            !snoozeRemindTime && date.getTime() <= thisMinute.getTime();
          const isSnoozeNotification =
            snoozeRemindTime &&
            snoozeRemindTime.getTime() <= thisMinute.getTime();

          if (isNormalNotification || isSnoozeNotification) {
            if (isNormalNotification) this.recurReminder(reminder);
            ipcRenderer
              .invoke('notify', {
                type: 'reminder',
                title: reminder.title,
              })
              .then(({ stopReminder }) => {
                if (stopReminder) {
                  this.stopReminder(reminder.id);
                } else {
                  this.snoozeReminder(reminder.id);
                }
                this.saveState();
              });
          }
        });
    }, interval);
  }

  snoozeReminder(id: string): void {
    runInAction(() => {
      const reminder = this.allReminders[id];
      reminder.snoozeRemindTime = addMinutes(new Date(), 5);
    });
  }

  recurReminder(reminder: Reminder): void {
    const now = new Date();
    let remindTime = reminder.remindTime;
    const timeRepeat = reminder.timeRepeat;

    if (reminder.timeRepeat) {
      // Ensure next remind time for recurring reminders is in the future
      do {
        switch (timeRepeat?.unit) {
          case 'minute':
            remindTime = addMinutes(remindTime, timeRepeat?.num);
            break;
          case 'hour':
            remindTime = addHours(remindTime, timeRepeat?.num);
            break;
        }
      } while (remindTime.getTime() < now.getTime());
    }

    let nextRemindTime: Date | undefined;
    if (
      reminder.timeRepeat &&
      remindTime.getDay() === reminder.remindTime.getDay()
    ) {
      nextRemindTime = remindTime;
    } else if (reminder.dayRepeat) {
      nextRemindTime = getNextDay(reminder);
    }

    if (nextRemindTime) {
      runInAction(() => {
        const { id } = this.createReminder({
          title: reminder.title,
          dayRepeat: reminder.dayRepeat,
          note: reminder.note,
          startDate: reminder.startDate,
          startTime: reminder.startTime,
          stopped: false,
          remindTime: nextRemindTime!,
          timeRepeat: reminder.timeRepeat,
          tags: [],
        });
        for (let tag of reminder.tags) {
          this._putTag(id, tag);
        }
      });
    }

    this.saveState();
  }

  stopReminder(reminderId: string): void {
    const reminder = this.allReminders[reminderId];
    runInAction(() => {
      reminder.stopped = true;
    });

    this.saveState();
  }

  continueReminder(reminderId: string): void {
    this.allReminders[reminderId].stopped = false;
    const reminder = this.allReminders[reminderId];
    if (isOverdue(reminder)) this.snoozeReminder(reminderId);
    this.saveState();
  }

  loadWindowMode(miniMode?: boolean): void {
    runInAction(() => {
      this.miniMode = miniMode;
    });
  }

  showSidebarReminderInfo(reminderId: string): void {
    runInAction(() => {
      this.sidebarReminderInfo = reminderId;
      this.sidebarReminderInfoVisible = true;
    });
  }

  hideSidebarReminderInfo(): void {
    runInAction(() => {
      this.sidebarReminderInfoVisible = false;
    });
  }

  toggleSidebarReminderInfo(reminderId: string): void {
    if (
      this.sidebarReminderInfoVisible &&
      this.sidebarReminderInfo === reminderId
    ) {
      this.hideSidebarReminderInfo();
    } else {
      this.showSidebarReminderInfo(reminderId);
    }
  }

  editReminder(
    id: string,
    info: Partial<
      Pick<
        Reminder,
        | 'title'
        | 'note'
        | 'startTime'
        | 'startDate'
        | 'dayRepeat'
        | 'timeRepeat'
        | 'note'
      >
    >
  ) {
    runInAction(() => {
      this.allReminders[id] = { ...this.allReminders[id], ...info };
      const reminder = this.allReminders[id];
      if (info.startDate || info.startTime) {
        const startDate = info.startDate || reminder.startDate;
        const startTime = info.startTime || reminder.startTime;
        let newRemindTime = setDate(reminder.startDate, getDate(startDate));
        newRemindTime = setHours(newRemindTime, getHours(startTime));
        newRemindTime = setMinutes(newRemindTime, getMinutes(startTime));
        newRemindTime = setMonth(newRemindTime, getMonth(startDate));
        newRemindTime = setYear(newRemindTime, getYear(startDate));
        this.allReminders[id].remindTime = newRemindTime;
      }
    });
    this.updateWindowBadge();
    this.saveState();
  }

  addTag(reminderId: string, tag: string): void {
    runInAction(() => {
      this._putTag(reminderId, tag);
    });
    this.saveState();
  }

  stopReminderForToday(reminderId: string): void {
    const reminder = this.allReminders[reminderId];
    reminder.stopped = true;
    const newReminderId = v4();
    this.reminderIds.push(newReminderId);
    this.allReminders[newReminderId] = {
      ...reminder,
      id: newReminderId,
      stopped: false,
      remindTime: getNextDay(reminder),
    };
    this.updateWindowBadge();
    this.saveState();
  }

  removeTag(reminderId: string, tag: string): void {
    runInAction(() => {
      const reminder = this.allReminders[reminderId];
      reminder.tags = reminder.tags.filter(
        (reminderTag) => reminderTag !== tag
      );
    });
    this.saveState();
  }

  changeQuery(query: string): void {
    runInAction(() => {
      this.query = query;
    });
  }

  changeSelectedGroup(newGroup: string): void {
    runInAction(() => {
      this.selectedGroup = newGroup;
    });
  }

  changeScreen(newScreen: AppScreen): void {
    runInAction(() => {
      this.screen = newScreen;
    });
  }

  async setRunAtStartup(value: boolean): Promise<void> {
    await ipcRenderer.invoke('change-run-at-startup', { value });
    runInAction(() => {
      this.appSettings!.runAtStartup = value;
    });
    this.saveState();
  }
}

function toNearestMinute(date: Date): Date {
  const oneMinute = 1000 * 60;
  return new Date(Math.floor(date.getTime() / oneMinute) * oneMinute);
}
