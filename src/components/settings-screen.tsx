import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { AppBar, Toolbar, IconButton, Typography, Switch } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AppStateContext } from 'context';
import { makeStyles } from 'make-styles';

const useStyles = makeStyles()((theme) => ({
  settings: {
    display: 'flex',
    flexDirection: 'column',
    margin: '16px auto',
    width: '500px',
    [theme.breakpoints.down('sm')]: {
      width: '80%',
    },
  },
  setting: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const SettingsScreen = () => {
  const state = useContext(AppStateContext)!;
  const { classes } = useStyles();

  const onChangeRunAtStartup = (event) => {
    state.setRunAtStartup(event.target.checked);
  };

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            onClick={() => state.changeScreen('main')}
            color="inherit"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Settings</Typography>
        </Toolbar>
      </AppBar>
      <div style={{ width: '100%', height: '100%' }}>
        <div className={classes.settings}>
          <div className={classes.setting}>
            <Typography>Run at startup</Typography>
            <Switch
              value={state.appSettings?.runAtStartup}
              onChange={onChangeRunAtStartup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(SettingsScreen);
