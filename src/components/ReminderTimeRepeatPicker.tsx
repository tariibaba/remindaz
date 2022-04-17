import {
  Button,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { ComponentProps } from 'react';
import { ReadableSeconds } from '../types';

export type ReminderTimeRepeatPickerProps = {
  popoverProps: ComponentProps<typeof Popover>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (newReadableSeconds: ReadableSeconds) => void;
  readableSeconds: ReadableSeconds;
};

const ReminderTimeRepeatPicker = (props: ReminderTimeRepeatPickerProps) => {
  const { popoverProps, onSave, onCancel, onChange, readableSeconds } = props;

  const onNumChange = (event) => {
    onChange({ ...readableSeconds!, num: Number(event.target.value) });
  };

  const onValueChange = (event) => {
    onChange({ ...readableSeconds!, unit: event.target.value });
  };

  return (
    <Popover {...popoverProps} sx={{ '& .MuiPaper-root': { padding: '10px' } }}>
      <Typography>Repeat every...</Typography>
      <div style={{ display: 'flex' }}>
        <TextField
          value={readableSeconds?.num}
          onInput={onNumChange}
          type="number"
        />
        <Select value={readableSeconds?.unit} onChange={onValueChange}>
          <MenuItem value="minute">minute(s)</MenuItem>
          <MenuItem value="hour">hour(s)</MenuItem>
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

export default ReminderTimeRepeatPicker;
