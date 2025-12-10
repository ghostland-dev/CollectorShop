import { useSnackbar } from 'notistack';

export function useNotifications() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    showSuccess: (message: string) => {
      enqueueSnackbar(message, { variant: 'success' });
    },
    showError: (message: string) => {
      enqueueSnackbar(message, { variant: 'error' });
    },
    showWarning: (message: string) => {
      enqueueSnackbar(message, { variant: 'warning' });
    },
    showInfo: (message: string) => {
      enqueueSnackbar(message, { variant: 'info' });
    },
  };
}
