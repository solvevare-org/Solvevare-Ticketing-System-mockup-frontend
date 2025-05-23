import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/auth-context';
import { TicketProvider } from '@/context/ticket-context';
import { NotificationProvider } from '@/context/notification-context';
import AppRoutes from '@/routes';

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </Router>
        </NotificationProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;