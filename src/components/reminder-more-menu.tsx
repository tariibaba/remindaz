import { Menu, MenuItem } from '@mui/material';
import { AppStateContext } from 'context';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';

const ReminderMoreMenu = observer(() => {
  const state = useContext(AppStateContext)!;
  const reminderMoreAnchorEl = state.reminderMoreAnchorEl;
  const reminderMore = state.reminderMore;

  const handleMoreActionsClose = () => {
    state.closeReminderMore();
  };

  const handleFastForwardDay = (reminderId: string) => {
    state.fastForwardDay(reminderId);
    handleMoreActionsClose();
  };

  const handleFastForwardTime = (reminderId: string) => {
    state.fastForwardTime(reminderId);
    handleMoreActionsClose();
  };

  const handleDeleteClick = (reminderId: string) => {
    state.deleteReminder(reminderId);
    handleMoreActionsClose();
  };

  return (
    <Menu
      open={Boolean(reminderMoreAnchorEl)}
      onClose={handleMoreActionsClose}
      anchorEl={reminderMoreAnchorEl}
    >
      <MenuItem
        disabled={reminderMore?.stopped || !reminderMore?.dayRepeat}
        onClick={() => handleFastForwardDay(reminderMore?.id!)}
      >
        Fast forward day
      </MenuItem>
      <MenuItem
        disabled={reminderMore?.stopped || !reminderMore?.timeRepeat}
        onClick={() => handleFastForwardTime(reminderMore?.id!)}
      >
        Fast forward time
      </MenuItem>
      <MenuItem onClick={() => handleDeleteClick(reminderMore?.id!)}>
        Delete
      </MenuItem>
    </Menu>
  );
});

export default ReminderMoreMenu;
