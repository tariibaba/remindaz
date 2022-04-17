import { CalendarPicker } from '@mui/lab';
import { Popover, Button } from '@mui/material';
import React, { ComponentProps } from 'react';

export type ReminderDatePickerProps = {
  popoverProps: ComponentProps<typeof Popover>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (date: Date) => void;
  date?: Date;
};

const ReminderDatePicker = (props: ReminderDatePickerProps) => {
  const { onSave, onCancel, popoverProps, date, onChange } = props;

  return (
    <Popover {...popoverProps}>
      <CalendarPicker date={date} onChange={(newDate) => onChange(newDate!)} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '16px',
          marginTop: 0,
        }}
      >
        <Button onClick={() => onCancel()} style={{ marginRight: '8px' }}>
          Cancel
        </Button>
        <Button onClick={() => onSave()} variant="contained">
          Save
        </Button>
      </div>
    </Popover>
  );
};

export default ReminderDatePicker;
