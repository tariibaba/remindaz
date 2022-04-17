import React from 'react';
import { AppState } from './state';

export const AppStateContext = React.createContext<AppState | undefined>(
  undefined
);
