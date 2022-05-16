import { useTheme, Theme, SxProps } from '@mui/material';

export function createSxStylesHook(useTheme: () => Theme) {
  return function createSxStyles<R extends { [name: string]: SxProps<Theme> }>(
    callback: (theme: Theme) => R
  ) {
    return () => callback(useTheme());
  };
}

export const createSxStyles: ReturnType<typeof createSxStylesHook> = (
  callback
) => {
  return createSxStylesHook(useTheme)(callback);
};
