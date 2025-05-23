import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Create mock notifications
const generateMockNotifications = (): Notification[] => {
  const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
  const mockNotifications: Notification[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const createdDate = new Date();
    createdDate.setHours(createdDate.getHours() - i);
    
    mockNotifications.push({
      id: uuidv4(),
      type: types[Math.floor(Math.random() * types.length)],
      title: `Notification ${i}`,
      message: `This is a mock notification number ${i}.`,
      read: i > 3,
      createdAt: createdDate.toISOString(),
    });
  }
  
  return mockNotifications;
};

// Notification context type
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider props
interface NotificationProviderProps {
  children: React.ReactNode;
}

// Notification provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications());
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications([newNotification, ...notifications]);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}