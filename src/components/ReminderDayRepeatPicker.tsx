import {
  Popover,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import React, { ComponentProps, useState } from 'react';
import { ReadableDays } from '../types';

export type ReminderDayRepeatPickerProps = {
  popoverProps: ComponentProps<typeof Popover>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (newValue: ReadableDays) => void;
  readableDay: ReadableDays;
};

const ReminderDayRepeatPicker = (props: ReminderDayRepeatPickerProps) => {
  const { onSave, popoverProps, onCancel, onChange, readableDay } = props;
  const onNumChange = (event) => {
    const value = event.currentTarget.value;
    onChange({ ...readableDay, num: Number(value) });
  };

  const onUnitChange = (event) => {
    const value = event.currentTarget.value;
    onChange({ ...readableDay, unit: value });
  };

  return (
    <Popover {...popoverProps} sx={{ '& .MuiPaper-root': { padding: '10px' } }}>
      <Typography>Repeat in...</Typography>
      <div style={{ display: 'flex' }}>
        <TextField
          value={readableDay?.num}
          onInput={onNumChange}
          type="number"
        />
        <Select onChange={onUnitChange} value={readableDay?.unit}>
          <MenuItem value="day">day(s)</MenuItem>
          <MenuItem value="week">week(s)</MenuItem>
          <MenuItem value="month">month(s)</MenuItem>
          <MenuItem value="year">year(s)</MenuItem>
        </Select>
      </div>
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button onClick={() => onCancel()}>Cancel</Button>
        <Button onClick={() => onSave()} variant="contained">
          Save
        </Button>
      </div>
    </Popover>
  );
};

export default ReminderDayRepeatPicker;
