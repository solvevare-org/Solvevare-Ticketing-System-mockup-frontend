import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole } from '@/context/auth-context';
import { useNotifications } from '@/context/notification-context';
import { NotificationsPopover } from '@/components/notifications/notifications-popover';

interface TopbarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const roleLabels: Record<UserRole, string> = {
  tenant: 'Tenant',
  staff: 'Maintenance Staff',
  manager: 'Property Manager',
};

export function Topbar({ onMenuClick, showMenuButton }: TopbarProps) {
  const { user, logout, switchRole } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-card border-b h-16 flex items-center px-4 sticky top-0 z-30">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Role Switcher (for demo purposes) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {roleLabels[user?.role || 'tenant']} View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => switchRole('tenant')}>
                Tenant View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('staff')}>
                Staff View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('manager')}>
                Manager View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationsPopover>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </NotificationsPopover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}