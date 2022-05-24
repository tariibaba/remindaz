import {
  AccessAlarm,
  CalendarToday,
  Close,
  EventRepeat,
  Refresh,
  Add,
} from '@mui/icons-material';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppStateContext } from '../context';
import { ReadableDays, ReadableSeconds } from '../types';
import getReadableDay from '../utils/readable-date';
import * as readableDay from '../utils/readable-day';
import * as readableSecond from '../utils/readable-second';
import ReminderDatePicker from './ReminderDatePicker';
import ReminderDayRepeatPicker from './ReminderDayRepeatPicker';
import ReminderTimePicker from './ReminderTimePicker';
import ReminderTimeRepeatPicker from './ReminderTimeRepeatPicker';
import { Tag } from 'mdi-material-ui';
import { makeStyles } from 'make-styles';
import clsx from 'clsx';

const useStyles = makeStyles()(() => ({
  sidebar: {
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    boxSizing: 'border-box',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
    overflowY: 'auto',
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    '& .MuiListItemIcon-root': {
      minWidth: 'fit-content',
      marginRight: '16px',
    },
  },
  sidebarHidden: {
    display: 'none',
  },
}));

const ReminderInfoSidebar = () => {
  const state = useContext(AppStateContext)!;
  const id = state.sidebarReminderInfo;
  const reminder = id ? state.allReminders[id] : undefined;

  const [titleInputValue, setTitleInputValue] = useState<string>();
  const titleInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    setTitleInputValue(reminder?.title);
    setNoteTextFieldValue(reminder?.note!);
  }, [state.sidebarReminderInfo]);

  const onTitleInputChange = (event) => {
    const value = event.currentTarget.value;
    setTitleInputValue(value);
  };

  const onTitleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (titleInputValue) {
        state.editReminder(reminder?.id!, { title: titleInputValue });
      } else {
        setTitleInputValue(reminder?.title);
      }
      titleInputRef.current?.blur();
    }
  };

  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState<Date | undefined>(
    undefined
  );
  const dateButtonClick = (event) => {
    setDatePickerDate(reminder?.startDate);
    setDatePickerAnchorEl(event.currentTarget);
    setDatePickerOpen(true);
  };
  const saveDatePickerDate = () => {
    state.editReminder(reminder?.id!, { startDate: new Date(datePickerDate!) });
    setDatePickerOpen(false);
  };

  const [timePickerAnchorEl, setTimePickerAnchorEl] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTime, setTimePickerTime] = useState<Date>(new Date());
  const timeButtonClick = (event) => {
    setTimePickerTime(reminder?.startTime!);
    setTimePickerAnchorEl(event.currentTarget);
    setTimePickerOpen(true);
  };

  const saveTimePickerTime = () => {
    state.editReminder(reminder?.id!, { startTime: new Date(timePickerTime) });
    setTimePickerOpen(false);
  };

  const [dayRepeatPickerOpen, setDayRepeatPickerOpen] = useState(false);
  const [dayRepeatPickerValue, setDayRepeatPickerValue] =
    useState<ReadableDays>();
  const [dayRepeatPickerAnchorEl, setDayRepeatPickerAnchorEl] = useState();
  const dayRepeatButtonClick = (event) => {
    setDayRepeatPickerAnchorEl(event.currentTarget);
    if (reminder?.dayRepeat) {
      setDayRepeatPickerValue({ ...reminder?.dayRepeat! });
    } else {
      setDayRepeatPickerValue({ num: 1, unit: 'day' });
    }
    setDayRepeatPickerOpen(true);
  };
  const saveDayRepeatPickerDay = () => {
    setDayRepeatPickerOpen(false);
    state.editReminder(reminder?.id!, {
      dayRepeat: {
        ...dayRepeatPickerValue!,
        num: Math.max(1, dayRepeatPickerValue?.num!),
      },
    });
  };

  const saveTimeRepeatPickerReadableSeconds = () => {
    state.editReminder(reminder?.id!, {
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
    if (reminder?.timeRepeat) {
      setTimeRepeatPickerReadableSeconds({ ...reminder?.timeRepeat! });
    } else {
      setTimeRepeatPickerReadableSeconds({ num: 1, unit: 'hour' });
    }
    setTimeRepeatPickerOpen(true);
  };

  const removeDayRepeatButtonClick = (event) => {
    state.editReminder(reminder?.id!, { dayRepeat: undefined });
  };

  const removeTimeRepeatButtonClick = (event) => {
    state.editReminder(reminder?.id!, { timeRepeat: undefined });
  };

  const [noteTextFieldValue, setNoteTextFieldValue] = useState<string>(
    reminder?.note!
  );
  const onNoteTextFieldChange = (event) => {
    setNoteTextFieldValue(event.currentTarget.value);
  };
  const onNoteTextFieldBlur = () => {
    state.editReminder(reminder?.id!, { note: noteTextFieldValue });
  };

  const [newTag, setNewTag] = useState<string>('');
  const onTagTextFieldChange = (event) => {
    setNewTag(event.currentTarget.value);
  };

  const onTagTextFieldKeydown = (event) => {
    if (event.key === 'Enter') {
      addTag();
    }
  };

  const onTagTextFieldButtonClick = () => {
    addTag();
  };

  const addTag = () => {
    if (
      !reminder?.tags.find((tag) => tag.toLowerCase() === newTag.toLowerCase())
    ) {
      state.addTag(reminder?.id!, newTag);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    state.removeTag(reminder?.id!, tag);
  };

  const { classes } = useStyles();

  useEffect(() => {
    if (!state.sidebarReminderInfoVisible) {
      setNewTag('');
    }
  }, [state.sidebarReminderInfoVisible]);

  return (
    <>
      <div
        className={clsx(
          classes.sidebar,
          !state.sidebarReminderInfoVisible && classes.sidebarHidden
        )}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '16px',
          }}
        >
          <IconButton onClick={() => state.hideSidebarReminderInfo()}>
            <Close fontSize="small" />
          </IconButton>
        </div>
        <TextField
          value={titleInputValue}
          onChange={onTitleInputChange}
          onKeyDown={onTitleInputKeyDown}
          inputRef={titleInputRef}
        />
        <div>
          <List>
            <ListItem>
              <ListItemButton onClick={dateButtonClick}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText sx={{ color: 'primary.main' }}>
                  {reminder?.remindTime
                    ? getReadableDay(reminder?.remindTime!)
                    : 'Date'}
                </ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={dayRepeatButtonClick}>
                <ListItemIcon
                  sx={{ color: reminder?.dayRepeat && 'primary.main' }}
                >
                  <EventRepeat />
                </ListItemIcon>
                <ListItemText
                  sx={{ color: reminder?.dayRepeat && 'primary.main' }}
                >
                  {reminder?.dayRepeat
                    ? `${readableDay.getString(reminder?.dayRepeat!)}`
                    : 'Repeat in... (date)'}
                </ListItemText>
              </ListItemButton>
              {reminder?.dayRepeat && (
                <IconButton onClick={removeDayRepeatButtonClick}>
                  <Close fontSize="small" />
                </IconButton>
              )}
            </ListItem>
            <ListItem>
              <ListItemButton onClick={timeButtonClick}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <AccessAlarm />
                </ListItemIcon>
                <ListItemText sx={{ color: 'primary.main' }}>
                  {reminder?.remindTime
                    ? format(reminder?.remindTime!, 'h:mm a')
                    : 'Time'}
                </ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={timeRepeatButtonClick}>
                <ListItemIcon
                  sx={{ color: reminder?.timeRepeat && 'primary.main' }}
                >
                  <div style={{ position: 'relative', marginTop: 0 }}>
                    <AccessAlarm />
                    <div
                      style={{
                        position: 'absolute',
                        left: '-10%',
                        bottom: '5%',
                        height: 15,
                        width: 15,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                      }}
                    >
                      <Refresh style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
                </ListItemIcon>
                <ListItemText
                  sx={{ color: reminder?.timeRepeat && 'primary.main' }}
                >
                  {reminder?.timeRepeat
                    ? readableSecond.getString(reminder?.timeRepeat!)
                    : 'Repeat in... (time)'}
                </ListItemText>
              </ListItemButton>
              {reminder?.timeRepeat && (
                <IconButton onClick={removeTimeRepeatButtonClick}>
                  <Close fontSize="small" />
                </IconButton>
              )}
            </ListItem>
          </List>
        </div>
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <Tag sx={{ color: '#616161', marginRight: '8px' }} />
          <Typography variant="subtitle2">Tags</Typography>
        </div>
        <Paper
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0,
            m: 0,
          }}
        >
          {reminder?.tags?.length! > 0 ? (
            reminder?.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{ margin: 1 }}
                onDelete={() => removeTag(tag)}
              />
            ))
          ) : (
            <Typography sx={{ margin: 1 }}>No tags</Typography>
          )}
        </Paper>
        <TextField
          placeholder="Add a tag"
          variant="standard"
          onChange={onTagTextFieldChange}
          onKeyDown={onTagTextFieldKeydown}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={onTagTextFieldButtonClick}
                style={{ visibility: newTag ? 'visible' : 'hidden' }}
              >
                <Add />
              </IconButton>
            ),
          }}
          disabled={reminder?.tags?.length === 5}
          value={newTag}
        />
        <TextField
          placeholder="Note"
          multiline={true}
          onBlur={onNoteTextFieldBlur}
          onChange={onNoteTextFieldChange}
          value={noteTextFieldValue}
          sx={{ marginTop: 4 }}
          rows={4}
        />
      </div>
      <ReminderDatePicker
        popoverProps={{
          open: datePickerOpen,
          anchorEl: datePickerAnchorEl,
          onClose: () => setDatePickerOpen(false),
        }}
        onSave={() => saveDatePickerDate()}
        onCancel={() => setDatePickerOpen(false)}
        date={datePickerDate}
        onChange={(newDate) => setDatePickerDate(new Date(newDate))}
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
};

export default observer(ReminderInfoSidebar);
