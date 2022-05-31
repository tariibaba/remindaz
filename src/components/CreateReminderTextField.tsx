import {
  AccessAlarm,
  CalendarToday,
  EventRepeat,
  Refresh,
} from '@mui/icons-material';
import { Button, TextField } from '@mui/material';
import {
  addHours,
  format,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppStateContext } from '../context';
import { ReadableDays, ReadableSeconds, Reminder } from '../types';
import ReminderDatePicker from './ReminderDatePicker';
import ReminderTimePicker from './ReminderTimePicker';
import * as readableDay from '../utils/readable-day';
import * as readableSecond from '../utils/readable-second';
import ReminderDayRepeatPicker from './ReminderDayRepeatPicker';
import ReminderTimeRepeatPicker from './ReminderTimeRepeatPicker';
import getReadableDay from '../utils/readable-date';

function getDefaultNewReminder(): Omit<Reminder, 'id'> {
  const date = addHours(new Date(), 1);
  return {
    startDate: new Date(date),
    startTime: new Date(date),
    title: '',
    dayRepeat: undefined,
    stopped: false,
    remindTime: new Date(date),
    timeRepeat: undefined,
    tags: [],
  };
}

const CreateReminderTextField = observer(() => {
  const prevNewReminderTitle = useRef<string>('');
  const onInputChange = (event) => {
    const value = event.target.value;
    if (!prevNewReminderTitle.current) {
      setNewReminder({ ...getDefaultNewReminder(), title: value });
    } else setNewReminder({ ...newReminder!, title: value });
    prevNewReminderTitle.current = value;
  };

  const saveTimePickerTime = () => {
    setNewReminder({ ...newReminder!, startTime: new Date(timePickerTime) });
    setTimePickerOpen(false);
  };

  const [dayRepeatPickerOpen, setDayRepeatPickerOpen] = useState(false);
  const [dayRepeatPickerValue, setDayRepeatPickerValue] =
    useState<ReadableDays>();
  const [dayRepeatPickerAnchorEl, setDayRepeatPickerAnchorEl] = useState();
  const dayRepeatButtonClick = (event) => {
    setDayRepeatPickerAnchorEl(event.currentTarget);
    if (newReminder?.dayRepeat) {
      setDayRepeatPickerValue({ ...newReminder?.dayRepeat! });
    } else {
      setDayRepeatPickerValue({ num: 1, unit: 'day' });
    }
    setDayRepeatPickerOpen(true);
  };
  const saveDayRepeatPickerDay = () => {
    setDayRepeatPickerOpen(false);
    setNewReminder({
      ...newReminder!,
      dayRepeat: {
        ...dayRepeatPickerValue!,
        num: Math.max(1, dayRepeatPickerValue?.num!),
      },
    });
  };

  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<
    HTMLElement | undefined
  >(undefined);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState<Date | undefined>(
    undefined
  );
  const dateButtonClick = (event) => {
    setDatePickerDate(newReminder?.startDate);
    setDatePickerAnchorEl(event.currentTarget);
    setDateMenuOpen(true);
  };
  const setNewReminderDate = (date: Date) => {
    setNewReminder({
      ...newReminder!,
      startDate: new Date(date),
    });
  };
  const [newReminder, setNewReminder] = useState<
    Omit<Reminder, 'id'> | undefined
  >(undefined);

  const state = useContext(AppStateContext)!;

  const createReminder = () => {
    state.createReminder({ ...newReminder! });
    setNewReminder({ ...getDefaultNewReminder() });
  };
  useEffect(() => {
    if (newReminder) {
      setNewReminder({
        ...newReminder!,
        remindTime: setHours(
          setMinutes(
            newReminder?.startDate!,
            getMinutes(newReminder?.startTime!)
          ),
          getHours(newReminder?.startTime!)
        ),
      });
    }
  }, [newReminder?.startDate, newReminder?.startTime]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newReminder?.title) {
      createReminder();
    }
  };

  const [timePickerAnchorEl, setTimePickerAnchorEl] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTime, setTimePickerTime] = useState<Date>(new Date());
  const timeButtonClick = (event) => {
    setTimePickerTime(newReminder?.startTime!);
    setTimePickerAnchorEl(event.currentTarget);
    setTimePickerOpen(true);
  };

  const saveTimeRepeatPickerReadableSeconds = () => {
    setNewReminder({
      ...newReminder!,
      timeRepeat: {
        ...timeRepeatPickerReadableSeconds!,
        num: Math.max(1, timeRepeatPickerReadableSeconds?.num!),
      },
    });
    setTimeRepeatPickerOpen(false);
  };

  const [timeRepeatPickerOpen, setTimeRepeatPickerOpen] = useState(false);
  const [timeRepeatPickerReadableSeconds, setTimeRepeatPickerReadableSeconds] =
    useState<ReadableSeconds>();
  const [timeRepeatPickerAnchorEl, setTimeRepeatPickerAnchorEl] = useState();
  const timeRepeatButtonClick = (event) => {
    setTimeRepeatPickerAnchorEl(event.currentTarget);
    if (newReminder?.timeRepeat) {
      setTimeRepeatPickerReadableSeconds({ ...newReminder?.timeRepeat! });
    } else {
      setTimeRepeatPickerReadableSeconds({ num: 1, unit: 'hour' });
    }
    setTimeRepeatPickerOpen(true);
  };

  return (
    <>
      <TextField
        className="create-reminder-text-field"
        variant="outlined"
        placeholder="Add new reminder"
        sx={{ marginTop: 'auto', width: '100%' }}
        onKeyDown={handleKeyDown}
        value={newReminder?.title || ''}
        onChange={onInputChange}
        InputProps={{
          endAdornment: (
            <div
              style={{
                display: 'flex',
                visibility: newReminder?.title ? 'visible' : 'hidden',
              }}
            >
              <Button
                onClick={dateButtonClick}
                style={{ whiteSpace: 'nowrap' }}
              >
                <CalendarToday />
                {newReminder?.startDate &&
                  getReadableDay(newReminder?.startDate!)}
              </Button>
              <Button
                onClick={dayRepeatButtonClick}
                style={{ whiteSpace: 'nowrap' }}
              >
                <EventRepeat />
                {newReminder?.dayRepeat &&
                  readableDay.getString(newReminder?.dayRepeat)}
              </Button>
              <Button
                onClick={timeButtonClick}
                style={{ whiteSpace: 'nowrap' }}
              >
                <AccessAlarm />
                {newReminder?.startTime &&
                  format(newReminder.startTime, 'h:mm a')}
              </Button>
              <Button
                style={{ whiteSpace: 'nowrap' }}
                onClick={timeRepeatButtonClick}
              >
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <AccessAlarm />
                  <div
                    style={{
                      position: 'absolute',
                      left: '-10%',
                      bottom: '20%',
                      height: 15,
                      width: 15,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                    }}
                  >
                    <Refresh style={{ height: '100%', width: '100%' }} />
                  </div>
                </div>
                {newReminder?.timeRepeat &&
                  readableSecond.getString(newReminder?.timeRepeat!)}
              </Button>
            </div>
          ),
        }}
      />
      <ReminderDatePicker
        date={datePickerDate}
        onChange={(newDate) => setNewReminderDate(newDate)}
        onClose={() => setDateMenuOpen(false)}
        open={dateMenuOpen}
        anchorEl={datePickerAnchorEl}
      />
      <ReminderTimePicker
        popoverProps={{
          open: timePickerOpen,
          anchorEl: timePickerAnchorEl,
          onClose: () => setTimePickerOpen(false),
        }}
        onCancel={() => setTimePickerOpen(false)}
        onSave={() => saveTimePickerTime()}
        time={timePickerTime}
        onChange={(newTime) => setTimePickerTime(new Date(newTime!))}
      />
      <ReminderDayRepeatPicker
        popoverProps={{
          open: dayRepeatPickerOpen,
          onClose: () => setDayRepeatPickerOpen(false),
          anchorEl: dayRepeatPickerAnchorEl,
        }}
        readableDay={dayRepeatPickerValue!}
        onChange={(newValue) => setDayRepeatPickerValue({ ...newValue })}
        onSave={() => saveDayRepeatPickerDay()}
        onCancel={() => setDayRepeatPickerOpen(false)}
      />
      <ReminderTimeRepeatPicker
        onSave={saveTimeRepeatPickerReadableSeconds}
        onCancel={() => setTimeRepeatPickerOpen(false)}
        popoverProps={{
          open: timeRepeatPickerOpen,
          onClose: () => setTimeRepeatPickerOpen(false),
          anchorEl: timeRepeatPickerAnchorEl,
        }}
        onChange={(newReadableSeconds) =>
          setTimeRepeatPickerReadableSeconds({ ...newReadableSeconds })
        }
        readableSeconds={timeRepeatPickerReadableSeconds!}
      />
    </>
  );
});

export default CreateReminderTextField;
