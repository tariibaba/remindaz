import { StaticTimePicker } from '@mui/lab';
import { Popover, TextField, Button } from '@mui/material';
import React, { ComponentProps } from 'react';

export type ReminderTimePickerProps = {
  popoverProps: ComponentProps<typeof Popover>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (newTime: Date) => void;
  time?: Date;
};

const ReminderTimePicker = (props: ReminderTimePickerProps) => {
  const { onSave, onCancel, onChange, time, popoverProps } = props;
  return (
    <Popover {...popoverProps}>
      <StaticTimePicker
        value={time}
        onChange={(newTime) => onChange(newTime!)}
        ampm={true}
        ampmInClock={true}
        openTo="hours"
        renderInput={(params) => <TextField {...params} />}
      />
      <div>
        <Button onClick={() => onSave()}>Save</Button>
        <Button onClick={() => onCancel()}>Cancel</Button>
      </div>
    </Popover>
  );
};

export default ReminderTimePicker;
