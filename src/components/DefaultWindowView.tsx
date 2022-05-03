import { observer } from 'mobx-react';
import { useContext, useState } from 'react';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AppStateContext } from '../context';
import React from 'react';
import './DefaultWindowView.css';
import MainScreen from './main-screen';
import SettingsScreen from './settings-screen';

const Main = () => {
  const state = useContext(AppStateContext)!;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="App">
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: state.screen === 'main' ? 'block' : 'none',
          }}
        >
          <MainScreen />
        </div>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: state.screen === 'settings' ? 'block' : 'none',
          }}
        >
          <SettingsScreen />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default observer(Main);
