import React, { createContext, useState, useContext, ReactNode } from 'react';

export type NotificationStatus = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: number;
  message: string;
  status: NotificationStatus;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, status: NotificationStatus) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, status: NotificationStatus) => {
    const id = new Date().getTime();
    setNotifications(prev => [...prev, { id, message, status }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000); // Auto-remove after 5 seconds
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};