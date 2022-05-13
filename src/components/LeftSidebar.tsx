import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { AppStateContext } from '../context';

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

  const onChangeGroup = (group: string) => {
    state?.changeSelectedGroup(group);
    onClose();
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {['All', 'Overdue', 'Today', 'Tomorrow', 'Later'].map((text) => (
          <ListItemButton
            key={text}
            selected={text.toLowerCase() === state?.selectedGroup}
            onClick={() => onChangeGroup(text.toLowerCase())}
          >
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
            selected={tagName.toLowerCase() === state?.selectedGroup}
            onClick={() => onChangeGroup(tagName)}
          >
            <ListItemText>{tagName}</ListItemText>
          </ListItemButton>
        ))}
      </List>
    </>
  );
  return (
    <Box>
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
