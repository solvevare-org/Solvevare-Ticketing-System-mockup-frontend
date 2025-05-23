import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  BarChart, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight,
  ArrowRight,
  Building,
  Check,
  X,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { useTickets, Ticket, TicketStatus } from '@/context/ticket-context';
import { useToast } from '@/hooks/use-toast';

// Status badge component
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

// Status update dialog component
interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  onStatusUpdate: (status: TicketStatus) => void;
}

const StatusUpdateDialog = ({
  open,
  onOpenChange,
  ticket,
  onStatusUpdate,
}: StatusUpdateDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket.status);

  const handleUpdate = () => {
    onStatusUpdate(selectedStatus);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Change the status of ticket #{ticket.id.split('-')[1]}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TicketStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Ticket card component
interface TicketCardProps {
  ticket: Ticket;
  onStatusUpdate: () => void;
}

const TicketCard = ({ ticket, onStatusUpdate }: TicketCardProps) => {
  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{ticket.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {ticket.description}
            </CardDescription>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Unit {ticket.unitNumber}</span>
          </div>
          {ticket.scheduledDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(ticket.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-end gap-2">
        <Button variant="outline" onClick={onStatusUpdate}>
          Update Status
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/tickets/${ticket.id}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export function StaffDashboard() {
  const { user } = useAuth();
  const { tickets, changeStatus } = useTickets();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Get assigned tickets
  const assignedTickets = tickets.filter(t => t.assignedTo === user?.id);
  
  // Calculate stats
  const activeTickets = assignedTickets.filter(t => 
    ['assigned', 'in-progress'].includes(t.status)
  );
  const completedTickets = assignedTickets.filter(t => 
    ['resolved', 'closed'].includes(t.status)
  );
  const urgentTickets = assignedTickets.filter(t => 
    t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)
  );

  // Handle status update
  const handleStatusUpdate = (ticketId: string, status: TicketStatus) => {
    changeStatus(ticketId, status);
    toast({
      title: 'Status updated',
      description: 'The ticket status has been updated successfully.',
    });
  };

  // Open status dialog
  const openStatusDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setStatusDialogOpen(true);
  };

  // Today's schedule
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysSchedule = assignedTickets.filter(t => {
    if (!t.scheduledDate) return false;
    const scheduleDate = new Date(t.scheduledDate);
    return scheduleDate >= today && scheduleDate < tomorrow;
  }).sort((a, b) => {
    if (!a.scheduledDate || !b.scheduledDate) return 0;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  // Group tickets by status
  const ticketsByStatus = {
    assigned: assignedTickets.filter(t => t.status === 'assigned'),
    inProgress: assignedTickets.filter(t => t.status === 'in-progress'),
    onHold: assignedTickets.filter(t => t.status === 'on-hold'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button asChild>
          <Link to="/tickets">
            View All Tickets
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeTickets.length === 1 ? 'task' : 'tasks'} in progress
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
                  {completedTickets.length === 1 ? 'task' : 'tasks'} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{urgentTickets.length}</div>
                <p className="text-xs text-muted-foreground">
                  {urgentTickets.length === 1 ? 'urgent task' : 'urgent tasks'} assigned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assignedTickets.length ? 
                    `${Math.round((completedTickets.length / assignedTickets.length) * 100)}%` : 
                    'N/A'}
                </div>
                <Progress 
                  value={assignedTickets.length ? (completedTickets.length / assignedTickets.length) * 100 : 0} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest assigned and completed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {assignedTickets
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((ticket, index) => (
                    <div key={ticket.id} className="flex items-start space-x-4">
                      <div className="relative mt-0.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <Clock className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        {index !== 4 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            <Link 
                              to={`/tickets/${ticket.id}`}
                              className="hover:underline"
                            >
                              {ticket.title}
                            </Link>
                          </p>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unit {ticket.unitNumber} • Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-6">
          {/* Assigned Tasks */}
          <div className="grid gap-6">
            {/* New Assignments */}
            {ticketsByStatus.assigned.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>New Assignments</CardTitle>
                  <CardDescription>
                    Tasks that have been assigned to you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketsByStatus.assigned.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onStatusUpdate={() => openStatusDialog(ticket)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* In Progress */}
            {ticketsByStatus.inProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>
                    Tasks you are currently working on
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketsByStatus.inProgress.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onStatusUpdate={() => openStatusDialog(ticket)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* On Hold */}
            {ticketsByStatus.onHold.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>On Hold</CardTitle>
                  <CardDescription>
                    Tasks that are temporarily paused
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketsByStatus.onHold.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onStatusUpdate={() => openStatusDialog(ticket)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {Object.values(ticketsByStatus).every(tickets => tickets.length === 0) && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Active Tasks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You don't have any tasks assigned to you at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your maintenance tasks scheduled for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysSchedule.length > 0 ? (
                <div className="space-y-6">
                  {todaysSchedule.map((ticket, index) => (
                    <div key={ticket.id} className="relative">
                      {index !== 0 && (
                        <div className="absolute top-0 left-6 -ml-px h-full w-0.5 bg-muted" />
                      )}
                      <div className="flex space-x-4">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                            <span className="text-sm font-medium text-primary-foreground">
                              {new Date(ticket.scheduledDate!).getHours()}:{String(new Date(ticket.scheduledDate!).getMinutes()).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold">
                              <Link to={`/tickets/${ticket.id}`} className="hover:underline">
                                {ticket.title}
                              </Link>
                            </h4>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <div className="bg-card border rounded-lg p-4 space-y-4">
                            <p className="text-sm">{ticket.description}</p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Unit {ticket.unitNumber}</span>
                              </div>
                              <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                              <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg" />
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">Resident</span>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openStatusDialog(ticket)}
                                >
                                  Update Status
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                  <Link to={`/tickets/${ticket.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Tasks Scheduled for Today</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any maintenance tasks scheduled for today.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/schedule">View Full Schedule</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      {selectedTicket && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          ticket={selectedTicket}
          onStatusUpdate={(status) => handleStatusUpdate(selectedTicket.id, status)}
        />
      )}
    </div>
  );
}