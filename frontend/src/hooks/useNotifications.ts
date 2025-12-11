import { toast } from 'react-toastify';

export function useNotifications() {
  return {
    showSuccess: (message: string) => {
      toast.success(message);
    },
    showError: (message: string) => {
      toast.error(message);
    },
    showWarning: (message: string) => {
      toast.warning(message);
    },
    showInfo: (message: string) => {
      toast.info(message);
    },
  };
}
