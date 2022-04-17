import { makeAutoObservable, runInAction } from 'mobx';
import { v4 } from 'uuid';
import { Reminder } from './types';
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
} from 'date-fns';

const dataPath = ipcRenderer.sendSync('getUserDataPath');
console.log(`node env: ${process.env.NODE_ENV}`);

const filename =
  process.env.NODE_ENV === 'production' ? 'data.json' : 'dev_data.json';
const filePath = path.join(dataPath, filename);
console.log(filePath);

export class AppState {
  reminderIds: string[] = [];
  allReminders: Record<string, Reminder> = {};
  miniMode?: boolean;
  sidebarReminderInfo?: string;
  sidebarReminderInfoVisible: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async createReminder(reminder: Omit<Reminder, 'id'>) {
    const id = v4();
    runInAction(() => {
      this.reminderIds.push(id);
      this.allReminders[id] = { id, ...reminder };
    });
    await this.saveState();
    this.updateWindowBadge();
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
    };
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString);
  }

  async init() {
    await this.loadState();
    this.startNotificationCheck();
    this.updateWindowBadge();
  }

  updateWindowBadge() {
    const now = new Date();
    ipcRenderer.send(
      'update-badge',
      this.reminderIds.filter((id) => {
        const reminder = this.allReminders[id];
        return (
          !reminder.reminded &&
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
      });
    } catch {
      await this.saveState();
    }
  }

  startNotificationCheck() {
    setInterval(() => {
      const now = toNearestMinute(new Date());
      this.reminderIds
        .map((id) => this.allReminders[id])
        .forEach((reminder, index) => {
          const date = toNearestMinute(reminder.remindTime);
          if (date.getTime() <= now.getTime() && !reminder.reminded) {
            ipcRenderer
              .invoke('notify', {
                type: 'reminder',
                title: reminder.title,
              })
              .then((value) => {
                console.log('Reminder complete');
                this.reminderComplete(reminder.id);
              });
          }
        });
    }, 60000); // TODO: change back to 1 minute
  }

  reminderComplete(id: string): void {
    const reminder = this.allReminders[id];
    runInAction(() => {
      reminder.reminded = true;
    });

    // Ensure next remind time for recurring reminders is in the future
    const now = new Date();
    let remindTime = reminder.remindTime;
    const timeRepeat = reminder.timeRepeat;
    if (reminder.timeRepeat) {
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
      const dayRepeat = reminder.dayRepeat;
      switch (dayRepeat.unit) {
        case 'day':
          nextRemindTime = addDays(reminder.remindTime, dayRepeat.num);
          break;
        case 'week':
          nextRemindTime = addWeeks(reminder.remindTime, dayRepeat.num);
          break;
        case 'month':
          nextRemindTime = addMonths(reminder.remindTime, dayRepeat.num);
          break;
        case 'year':
          nextRemindTime = addYears(reminder.remindTime, dayRepeat.num);
      }
      nextRemindTime.setHours(reminder.startTime.getHours());
      nextRemindTime.setMinutes(reminder.startTime.getMinutes());
    }

    if (nextRemindTime) {
      runInAction(() => {
        this.createReminder({
          title: reminder.title,
          dayRepeat: reminder.dayRepeat,
          note: reminder.note,
          startDate: reminder.startDate,
          startTime: reminder.startTime,
          reminded: false,
          remindTime: nextRemindTime!,
          timeRepeat: reminder.timeRepeat,
        });
      });
    }
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
    this.saveState();
  }
}

function toNearestMinute(date: Date): Date {
  const oneMinute = 1000 * 60;
  return new Date(Math.floor(date.getTime() / oneMinute) * oneMinute);
}
