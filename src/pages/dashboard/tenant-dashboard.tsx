import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart, Clock, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useTickets, Ticket, TicketStatus } from '@/context/ticket-context';

// Status badge mapping
const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const variants: Record<TicketStatus, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
    'new': { variant: 'default', label: 'New' },
    'assigned': { variant: 'secondary', label: 'Assigned' },
    'in-progress': { variant: 'secondary', label: 'In Progress' },
    'on-hold': { variant: 'outline', label: 'On Hold' },
    'resolved': { variant: 'default', label: 'Resolved' },
    'closed': { variant: 'default', label: 'Closed' },
  };
  
  return (
    <Badge variant={variants[status].variant}>
      {variants[status].label}
    </Badge>
  );
};

// Ticket preview card
const TicketPreviewCard = ({ ticket }: { ticket: Ticket }) => {
  return (
    <Link to={`/tickets/${ticket.id}`} className="block">
      <Card className="hover:bg-accent/5 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{ticket.title}</CardTitle>
            <StatusBadge status={ticket.status} />
          </div>
          <CardDescription className="line-clamp-1">
            {ticket.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          <div className="flex justify-between w-full">
            <span>Ticket #{ticket.id.split('-')[1]}</span>
            <span>
              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export function TenantDashboard() {
  const { user } = useAuth();
  const { getTicketsByUser } = useTickets();
  const [tab, setTab] = useState('overview');

  // Get user tickets
  const userTickets = user ? getTicketsByUser(user.id) : [];
  
  // Calculate stats
  const activeTickets = userTickets.filter(t => 
    ['new', 'assigned', 'in-progress'].includes(t.status)
  );
  const completedTickets = userTickets.filter(t => 
    ['resolved', 'closed'].includes(t.status)
  );
  const urgentTickets = userTickets.filter(t => 
    t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)
  );
  
  // Recent tickets
  const recentTickets = [...userTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Upcoming maintenance
  const upcomingMaintenance = userTickets
    .filter(t => t.scheduledDate && new Date(t.scheduledDate) > new Date())
    .sort((a, b) => 
      new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button asChild>
          <Link to="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Service Request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeTickets.length === 1 ? 'request' : 'requests'} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {completedTickets.length === 1 ? 'request' : 'requests'} resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{urgentTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {urgentTickets.length === 1 ? 'high priority issue' : 'high priority issues'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userTickets.length ? 
                    `${Math.round((completedTickets.length / userTickets.length) * 100)}%` : 
                    'N/A'}
                </div>
                <Progress 
                  value={userTickets.length ? (completedTickets.length / userTickets.length) * 100 : 0} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests & Upcoming Maintenance */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
                <CardDescription>
                  Your recently submitted service requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTickets.length > 0 ? (
                  recentTickets.map((ticket) => (
                    <TicketPreviewCard key={ticket.id} ticket={ticket} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No recent service requests</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/tickets">View All Requests</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>
                  Scheduled maintenance visits for your property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingMaintenance.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMaintenance.map((ticket) => (
                      <div key={ticket.id} className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {new Date(ticket.scheduledDate!).toLocaleDateString()}
                            {' '}at{' '}
                            {new Date(ticket.scheduledDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No upcoming maintenance scheduled</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activity on your service requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTickets.length > 0 ? (
                <div className="space-y-8">
                  {[...userTickets]
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 10)
                    .map((ticket, i) => (
                      <div key={ticket.id} className="relative">
                        {i !== 0 && (
                          <span className="absolute top-0 left-2.5 h-full w-px bg-muted-foreground/20" />
                        )}
                        <div className="relative flex items-start gap-4">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <span className="h-3 w-3 rounded-full bg-background" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <p className="font-medium">
                                <Link to={`/tickets/${ticket.id}`} className="hover:underline">
                                  {ticket.title}
                                </Link>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Status changed to <StatusBadge status={ticket.status} />
                            </p>
                            {ticket.notes && ticket.notes.length > 0 && (
                              <div className="mt-2 border-l-2 border-muted pl-4">
                                <p className="text-sm">
                                  {ticket.notes[ticket.notes.length - 1].text}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No activity to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}