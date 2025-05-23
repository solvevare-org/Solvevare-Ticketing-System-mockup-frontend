import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNotifications, Notification } from '@/context/notification-context';

interface NotificationsPopoverProps {
  children: React.ReactNode;
}

export function NotificationsPopover({ children }: NotificationsPopoverProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleOpen = (open: boolean) => {
    setOpen(open);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      case 'warning':
        return <div className="h-2 w-2 rounded-full bg-yellow-500"></div>;
      case 'error':
        return <div className="h-2 w-2 rounded-full bg-red-500"></div>;
      default:
        return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">Mark all as read</span>
          </Button>
        </div>
        {notifications.length > 0 ? (
          <ScrollArea className="h-[calc(80vh-8rem)] max-h-[400px]">
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div key={notification.id} className="relative">
                  <div 
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-muted/30"
                    )}
                  >
                    <div className="flex items-start">
                      <div className="mt-1.5 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}