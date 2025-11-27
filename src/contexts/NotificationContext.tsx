import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface NotificationContextType {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  loading: (message: string) => string | number;
  dismiss: (toastId: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications: NotificationContextType = {
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    dismiss: (toastId: string | number) => {
      toast.dismiss(toastId);
    },
  };

  return (
    <NotificationContext.Provider value={notifications}>{children}</NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
