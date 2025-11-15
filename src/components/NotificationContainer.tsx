import React from 'react';
import { useNotification, NotificationStatus } from '../context/NotificationContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ICONS: Record<NotificationStatus, React.ElementType> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const BG_COLORS: Record<NotificationStatus, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {notifications.map(notification => {
        const Icon = ICONS[notification.status];
        return (
          <div
            key={notification.id}
            className={`${BG_COLORS[notification.status]} text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-right`}
          >
            <Icon className="h-6 w-6" />
            <span>{notification.message}</span>
            <button onClick={() => removeNotification(notification.id)} className="ml-auto font-bold"> &times; </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;