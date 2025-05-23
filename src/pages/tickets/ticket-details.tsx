import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ChevronLeft,
  Clock,
  Building,
  Calendar,
  MessageSquare,
  UserPlus,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuth } from '@/context/auth-context';
import { useTickets, TicketStatus, TicketPriority } from '@/context/ticket-context';
import { useToast } from '@/hooks/use-toast';

// Status badge
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

// Priority badge
const PriorityBadge = ({ priority }: { priority: TicketPriority }) => {
  const variants: Record<TicketPriority, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
    'low': { variant: 'outline', label: 'Low' },
    'medium': { variant: 'secondary', label: 'Medium' },
    'high': { variant: 'default', label: 'High' },
    'urgent': { variant: 'destructive', label: 'Urgent' },
  };
  
  return (
    <Badge variant={variants[priority].variant}>
      {variants[priority].label}
    </Badge>
  );
};

export function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTicket, staff, assignTicket } = useTickets();
  const { toast } = useToast();
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const ticket = getTicket(id!);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/tickets">View All Tickets</Link>
        </Button>
      </div>
    );
  }

  // Handle assignment submission
  const handleAssignSubmit = (staffId: string, scheduledDate: Date) => {
    assignTicket(ticket.id, staffId, scheduledDate.toISOString());
    toast({
      title: 'Ticket assigned',
      description: 'The ticket has been assigned successfully.',
    });
  };

  // Find assigned staff member
  const assignedStaff = ticket.assignedTo 
    ? staff.find(s => s.id === ticket.assignedTo)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Ticket #{ticket.id.split('-')[1]}</span>
              <span>•</span>
              <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ticket.images.map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={image} 
                        alt={`Ticket attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {ticket.notes && ticket.notes.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes & Updates</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.notes.map((note) => (
                  <div key={note.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardContent className="pt-6">
              {user?.role === 'manager' && !ticket.assignedTo && (
                <Button className="w-full mb-4" onClick={() => setAssignDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Ticket
                </Button>
              )}

              <div className="space-y-4">
                {/* Property Info */}
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      Unit {ticket.unitNumber}
                    </p>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    {assignedStaff ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignedStaff.avatar} />
                          <AvatarFallback>{assignedStaff.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p>{assignedStaff.name}</p>
                          <p className="text-xs text-muted-foreground">{assignedStaff.role}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned</p>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                {ticket.scheduledDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Scheduled Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(ticket.scheduledDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <p>Created: {format(new Date(ticket.createdAt), 'PP')}</p>
                      {ticket.completedDate && (
                        <p>Completed: {format(new Date(ticket.completedDate), 'PP')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {ticket.feedback && (
                  <div className="flex items-start gap-3">
                    <Star className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Tenant Feedback</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < ticket.feedback!.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      {ticket.feedback.comment && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{ticket.feedback.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assignment Dialog */}
      <AssignTicketDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        staff={staff}
        onAssign={handleAssignSubmit}
        ticketCategory={ticket.category}
      />
    </div>
  );
}