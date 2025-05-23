import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  ClipboardCheck, 
  Users, 
  BarChart4, 
  Settings, 
  DollarSign,
  Calendar,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/context/auth-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const getNavItemsByRole = (role: UserRole) => {
  // Common items for all roles
  const commonItems = [
    { to: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard', end: true },
  ];

  // Role-specific items
  switch (role) {
    case 'tenant':
      return [
        ...commonItems,
        { to: '/tickets', icon: <Ticket className="h-5 w-5" />, label: 'My Tickets' },
        { to: '/schedule', icon: <Calendar className="h-5 w-5" />, label: 'Schedule' },
        { to: '/help', icon: <HelpCircle className="h-5 w-5" />, label: 'Help & FAQ' },
      ];
    case 'staff':
      return [
        ...commonItems,
        { to: '/tickets', icon: <Ticket className="h-5 w-5" />, label: 'Service Tickets' },
        { to: '/schedule', icon: <Calendar className="h-5 w-5" />, label: 'Work Schedule' },
        { to: '/checklists', icon: <ClipboardCheck className="h-5 w-5" />, label: 'Checklists' },
      ];
    case 'manager':
      return [
        ...commonItems,
        { 
          label: 'Tickets',
          icon: <Ticket className="h-5 w-5" />,
          children: [
            { to: '/tickets', icon: <Ticket className="h-5 w-5" />, label: 'All Tickets' },
            { to: '/tickets/unassigned', icon: <Ticket className="h-5 w-5" />, label: 'Unassigned' },
          ]
        },
        { 
          label: 'Management',
          icon: <Users className="h-5 w-5" />,
          children: [
            { to: '/properties', icon: <Home className="h-5 w-5" />, label: 'Properties' },
            { to: '/staff', icon: <Users className="h-5 w-5" />, label: 'Staff & Vendors' },
          ]
        },
        { to: '/analytics', icon: <BarChart4 className="h-5 w-5" />, label: 'Analytics' },
        { to: '/finance', icon: <DollarSign className="h-5 w-5" />, label: 'Finance' },
        { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
      ];
    default:
      return commonItems;
  }
};

const NavItem = ({ to, icon, label, end = false, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground'
        )
      }
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const NavGroup = ({ label, icon, children }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if any child route is active
  useEffect(() => {
    // This assumes children are NavItems with a 'to' prop
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];
    const isAnyChildActive = childrenArray.some(
      child => location.pathname.startsWith(child.props.to)
    );
    
    if (isAnyChildActive) {
      setIsOpen(true);
    }
  }, [children, location.pathname]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md',
            'hover:bg-accent hover:text-accent-foreground',
            'text-muted-foreground'
          )}
        >
          <div className="flex items-center">
            <span className="mr-2">{icon}</span>
            <span>{label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 mt-1 space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { user } = useAuth();
  const role = user?.role || 'tenant';
  const navItems = getNavItemsByRole(role);

  // Generate sidebar content
  const renderNavItems = (items: any[]) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <NavGroup key={index} label={item.label} icon={item.icon}>
            {item.children.map((child: any, childIndex: number) => (
              <NavItem
                key={`${index}-${childIndex}`}
                to={child.to}
                icon={child.icon}
                label={child.label}
                end={child.end}
                onClick={isMobile ? onClose : undefined}
              />
            ))}
          </NavGroup>
        );
      } else {
        return (
          <NavItem
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            end={item.end}
            onClick={isMobile ? onClose : undefined}
          />
        );
      }
    });
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'h-full bg-card border-r z-50 transition-all duration-300 ease-in-out',
          isMobile
            ? cn(
                'fixed top-0 left-0 w-64',
                isOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : cn(
                'w-64 flex-shrink-0',
                isOpen ? 'w-64' : 'w-0 -ml-64'
              )
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center">
            <div className="rounded-md bg-primary p-1 mr-2">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">PPM Ticketing</span>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4 space-y-2">
            {renderNavItems(navItems)}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}