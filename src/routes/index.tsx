import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/pages/auth/login';
import { TenantDashboard } from '@/pages/dashboard/tenant-dashboard';
import { StaffDashboard } from '@/pages/dashboard/staff-dashboard';
import { ManagerDashboard } from '@/pages/dashboard/manager-dashboard';
import { ManagerAnalytics } from '@/pages/analytics/manager-analytics';
import { TicketList } from '@/pages/tickets/ticket-list';
import { CreateTicket } from '@/pages/tickets/create-ticket';
import { TicketDetails } from '@/pages/tickets/ticket-details';
import { TenantSchedule } from '@/pages/schedule/tenant-schedule';
import { StaffSchedule } from '@/pages/schedule/staff-schedule';
import { StaffChecklists } from '@/pages/checklists/staff-checklists';
import { TenantProfile } from '@/pages/profile/tenant-profile';
import { StaffProfile } from '@/pages/profile/staff-profile';
import { StaffList } from '@/pages/staff/staff-list';
import { TenantManagement } from '@/pages/properties/tenant-management';
import { SettingsPage } from '@/pages/settings/settings-page';
import { FinanceReports } from '@/pages/finance/finance-reports';
import { useAuth } from '@/context/auth-context';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Dashboard selector based on user role
const DashboardSelector = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'tenant':
      return <TenantDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

// Schedule selector based on user role
const ScheduleSelector = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'tenant':
      return <TenantSchedule />;
    case 'staff':
    case 'manager':
      return <StaffSchedule />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

// Profile selector based on user role
const ProfileSelector = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'tenant':
      return <TenantProfile />;
    case 'staff':
    case 'manager':
      return <StaffProfile />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect to dashboard if logged in and trying to access login page
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);
  
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* App routes */}
      <Route element={<AppShell />}>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />
        
        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <ManagerAnalytics />
            </ProtectedRoute>
          }
        />
        
        {/* Ticket routes */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />

        {/* Schedule route */}
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ScheduleSelector />
            </ProtectedRoute>
          }
        />

        {/* Staff management route */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffList />
            </ProtectedRoute>
          }
        />

        {/* Property management routes */}
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <TenantManagement />
            </ProtectedRoute>
          }
        />

        {/* Checklist route (staff only) */}
        <Route
          path="/checklists"
          element={
            <ProtectedRoute>
              <StaffChecklists />
            </ProtectedRoute>
          }
        />

        {/* Finance Reports route */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <FinanceReports />
            </ProtectedRoute>
          }
        />

        {/* Settings route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSelector />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}