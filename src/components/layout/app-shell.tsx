import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/context/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppShell() {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={!isMobile || isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Topbar 
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          showMenuButton={isMobile}
        />
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}