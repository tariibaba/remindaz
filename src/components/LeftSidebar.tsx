import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { ReminderList } from 'types';
import { AppStateContext } from '../context';
import { AllInclusive } from '@mui/icons-material';
import { StopCircleOutline, ProgressClock, Tag } from 'mdi-material-ui';
import { makeStyles } from '../make-styles';

type LeftSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const LeftSidebar = (props: LeftSidebarProps) => {
  const { open, onClose } = props;

  const state = useContext(AppStateContext);

  const toggleDrawer = () => {
    onClose();
  };

  const onChangeList = (group: ReminderList) => {
    state?.setSelectedDefaultList(group);
    onClose();
  };

  const onChangeTag = (tag: string) => {
    state?.setSelectedTag(tag);
    onClose();
  };

  const defaultListIcons = {
    All: <AllInclusive />,
    Active: <ProgressClock />,
    Stopped: <StopCircleOutline />,
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {['All', 'Active', 'Stopped'].map((text) => (
          <ListItemButton
            key={text}
            selected={
              (text.toLowerCase() as ReminderList) ===
              state?.selectedDefaultList
            }
            onClick={() => onChangeList(text.toLowerCase() as ReminderList)}
          >
            <ListItemIcon>{defaultListIcons[text]}</ListItemIcon>
            <ListItemText>{text}</ListItemText>
          </ListItemButton>
        ))}
        {state?.tagNames?.length! > 0 && (
          <Typography
            style={{ textAlign: 'center', marginTop: '16px' }}
            variant="subtitle2"
          >
            Tags
          </Typography>
        )}
        {state?.tagNames.map((tagName) => (
          <ListItemButton
            key={tagName}
            selected={tagName.toLowerCase() === state?.selectedTag}
            onClick={() => onChangeTag(tagName)}
          >
            <ListItemIcon>
              <Tag />
            </ListItemIcon>
            <ListItemText>{tagName}</ListItemText>
          </ListItemButton>
        ))}
      </List>
    </>
  );
  return (
    <Box
      sx={{
        '& .MuiListItemIcon-root': {
          minWidth: 'fit-content',
          marginRight: '16px',
        },
      }}
    >
      <Drawer
        open={open}
        sx={{ display: { sm: 'block', lg: 'none' }, position: 'fixed' }}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { sm: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { position: { sm: 'fixed', lg: 'static' } },
          height: '100%',
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default observer(LeftSidebar);
