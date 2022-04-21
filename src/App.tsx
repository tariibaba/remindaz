import { ipcRenderer } from 'electron';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import DefaultWindowView from './components/DefaultWindowView';
import MiniWindowView from './components/MiniWindowView';
import { AppStateContext } from './context';
import { AppState } from './state';

const AppStateContainer = () => {
  const [state] = useState(new AppState());

  return (
    <AppStateContext.Provider value={state}>
      <App />
    </AppStateContext.Provider>
  );
};

const App = observer(() => {
  const state = useContext(AppStateContext)!;

  useEffect(() => {
    state.init();
  }, []);

  let WindowView = state.miniMode ? MiniWindowView : DefaultWindowView;

  return (
    <AppStateContext.Provider value={state}>
      {state.miniMode === undefined ? <></> : <WindowView />}
    </AppStateContext.Provider>
  );
});

export default AppStateContainer;
