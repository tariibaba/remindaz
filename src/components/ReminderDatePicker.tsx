import { CalendarPicker } from '@mui/lab';
import { Popover, Button, Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addDays } from 'date-fns';
import {
  CalendarToday,
  CalendarArrowRight,
  CalendarCursor,
} from 'mdi-material-ui';

export type ReminderDatePickerProps = {
  onChange: (date: Date) => void;
  date?: Date;
  onClose: () => void;
  open: boolean;
  anchorEl?: HTMLElement;
};

const ReminderDatePicker = (props: ReminderDatePickerProps) => {
  const { open, anchorEl, date, onChange, onClose } = props;
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [datePickerDate, setDatePickerDate] = useState<Date>();

  useEffect(() => {
    setDatePickerDate(date);
  }, [date]);

  const showCalendarPicker = () => {
    setPopoverOpen(true);
  };

  const pickToday = () => {
    onChange(new Date());
    onClose();
  };

  const pickTomorrow = () => {
    onChange(addDays(new Date(), 1));
    onClose();
  };

  const saveDatePickerDate = () => {
    onChange(datePickerDate!);
    closePopover();
  };

  const closePopover = () => {
    setPopoverOpen(false);
    onClose();
  };

  return (
    <>
      <Menu
        open={open && !popoverOpen}
        anchorEl={anchorEl}
        onClose={() => onClose()}
      >
        <MenuItem onClick={pickToday}>
          <CalendarToday style={{ marginRight: '8px' }} />
          Today
        </MenuItem>
        <MenuItem onClick={pickTomorrow}>
          <CalendarArrowRight style={{ marginRight: '8px' }} />
          Tomorrow
        </MenuItem>
        <MenuItem onClick={showCalendarPicker}>
          <CalendarCursor style={{ marginRight: '8px' }} />
          Pick a date
        </MenuItem>
      </Menu>
      <Popover
        open={open && popoverOpen}
        anchorEl={popoverOpen ? anchorEl : undefined}
        onClose={() => closePopover()}
      >
        <CalendarPicker
          date={datePickerDate}
          onChange={(newDate) => setDatePickerDate(newDate!)}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            margin: '16px',
            marginTop: 0,
          }}
        >
          <Button onClick={() => closePopover()} style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button onClick={() => saveDatePickerDate()} variant="contained">
            Save
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default ReminderDatePicker;
