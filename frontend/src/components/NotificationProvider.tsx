import { ReactNode } from 'react';
import { SnackbarProvider } from 'notistack';

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={4000}
    >
      {children}
    </SnackbarProvider>
  );
}
