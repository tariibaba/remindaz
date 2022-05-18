import { makeAutoObservable, runInAction } from 'mobx';
import { v4 } from 'uuid';
import { Reminder, ReminderGroup, ReminderGroups, AppSettings } from './types';
import { ipcRenderer } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import {
  addHours,
  addMinutes,
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
  isYesterday,
  setDay,
  getDay,
} from 'date-fns';
import isDefaultReminderGroup from 'utils/is-tag';
import { getNextDay, isPast, isSnoozeDue } from 'utils/reminder';

const dataPath = ipcRenderer.sendSync('getUserDataPath');

const filename =
  process.env.NODE_ENV === 'production' ? 'data.json' : 'dev_data.json';
const filePath = path.join(dataPath, filename);

type AppScreen = 'main' | 'settings';

const defaultSettings: AppSettings = {
  runAtStartup: true,
};

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

  createReminder(options: Omit<Reminder, 'id'>) {
    const reminder = this.makeReminder(options);
    if (!isDefaultReminderGroup(this.selectedGroup)) {
      this._putTag(reminder, this.selectedGroup);
    }
    reminder.stopped = isPast(reminder);
    if (isPast(reminder) && (reminder.dayRepeat || reminder.timeRepeat)) {
      this.recurReminder(reminder);
    }
    this.updateWindowBadge();
    this.saveState();
  }

  makeReminder(options: Omit<Reminder, 'id'>): Reminder {
    const id = v4();
    this.reminderIds.push(id);
    this.allReminders[id] = {
      ...options,
      id,
      tags: [],
    };
    return this.allReminders[id];
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

  private _putTag(reminder: Reminder, tag: string): void {
    reminder.tags.push(tag);
    if (!this.allTags[tag]) {
      this.tagNames.push(tag);
      this.allTags[tag] = [];
    }
    this.allTags[tag].push(reminder.id);
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

  startNotificationCheck() {
    const devInterval = 10000;
    const interval =
      process.env.NODE_ENV === 'production' ? 60000 : devInterval;
    setInterval(() => {
      this.reminderIds
        .map((id) => this.allReminders[id])
        .filter((reminder) => !reminder.stopped)
        .forEach((reminder) => this.checkIfReminderDue(reminder));
    }, interval);
  }

  checkIfReminderDue(reminder: Reminder) {
    const normalNotification = !reminder.snoozeRemindTime && isPast(reminder);
    if (normalNotification || isSnoozeDue(reminder)) {
      if (normalNotification) this.recurReminder(reminder);
      this.sendNotification(reminder);
    }
  }

  async sendNotification(reminder: Reminder) {
    const { stopReminder } = await ipcRenderer.invoke('notify', {
      type: 'reminder',
      title: reminder.title,
    });
    if (stopReminder) {
      this.stopReminder(reminder.id);
    } else {
      this.snoozeReminder(reminder.id);
    }
    this.saveState();
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
    if (reminder.timeRepeat && isToday(remindTime)) {
      console.log(`remindTime: ${remindTime}`);
      nextRemindTime = remindTime;
    } else if (reminder.dayRepeat) {
      const nextDay = getNextDay(reminder);
      nextRemindTime = setYear(nextDay, getYear(nextDay));
      nextRemindTime = setMonth(nextDay, getMonth(nextDay));
      nextRemindTime = setDay(nextDay, getDay(nextDay));
    }
    console.log(`nextRemindTime: ${nextRemindTime}`);

    if (nextRemindTime) {
      runInAction(() => {
        const recurred = this.makeReminder({
          ...reminder,
          remindTime: nextRemindTime!,
          stopped: false,
          tags: [],
        });
        for (let tag of recurred.tags) {
          this._putTag(recurred, tag);
        }
      });
    }

    this.saveState();
  }

  stopReminder(reminderId: string): void {
    const reminder = this.allReminders[reminderId];
    reminder.stopped = true;
    this.updateWindowBadge();
    this.saveState();
  }

  continueReminder(reminderId: string): void {
    this.allReminders[reminderId].stopped = false;
    const reminder = this.allReminders[reminderId];
    if (isPast(reminder)) this.snoozeReminder(reminderId);
    this.updateWindowBadge();
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
      this._putTag(this.allReminders[reminderId], tag);
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
