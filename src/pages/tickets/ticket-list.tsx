import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, Filter, ArrowUpDown, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { useTickets, Ticket, TicketStatus, TicketPriority } from '@/context/ticket-context';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
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

export function TicketList() {
  const { user } = useAuth();
  const { tickets, staff, assignTicket } = useTickets();
  const { toast } = useToast();
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Tickets to display
  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);

  // Handle ticket assignment
  const handleAssign = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setAssignDialogOpen(true);
    }
  };

  // Handle assignment submission
  const handleAssignSubmit = (staffId: string, scheduledDate: Date) => {
    if (selectedTicket) {
      assignTicket(selectedTicket.id, staffId, scheduledDate.toISOString());
      toast({
        title: 'Ticket assigned',
        description: 'The ticket has been assigned successfully.',
      });
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...tickets];
    
    // Filter by user role
    if (user?.role === 'tenant') {
      filtered = filtered.filter((ticket) => ticket.createdBy === user.id);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) => 
          ticket.title.toLowerCase().includes(term) || 
          ticket.description.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priority':
        const priorityOrder: Record<TicketPriority, number> = {
          'urgent': 0,
          'high': 1,
          'medium': 2,
          'low': 3,
        };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'status':
        const statusOrder: Record<TicketStatus, number> = {
          'new': 0,
          'assigned': 1,
          'in-progress': 2,
          'on-hold': 3,
          'resolved': 4,
          'closed': 5,
        };
        filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }
    
    setDisplayedTickets(filtered);
  }, [tickets, user, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Tickets</h1>
          <p className="text-muted-foreground">
            {user?.role === 'tenant' 
              ? 'Manage your service requests'
              : 'Manage and track service tickets'}
          </p>
        </div>
        {user?.role === 'tenant' && (
          <Button asChild>
            <Link to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Priority</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Category</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="pest">Pest Control</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span>Sort By</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {displayedTickets.length > 0 ? (
          displayedTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:bg-accent/5 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {ticket.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div>Ticket #{ticket.id.split('-')[1]}</div>
                  <div>Unit {ticket.unitNumber}</div>
                  <div>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</div>
                  {ticket.assignedTo && (
                    <div>Assigned to staff</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                {user?.role === 'manager' && !ticket.assignedTo && (
                  <Button variant="outline" onClick={() => handleAssign(ticket.id)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to={`/tickets/${ticket.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No tickets found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : user?.role === 'tenant'
                    ? 'You haven\'t submitted any service requests yet'
                    : 'There are no service tickets to display'}
              </p>
              {user?.role === 'tenant' && (
                <Button className="mt-4" asChild>
                  <Link to="/tickets/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit a New Request
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignment Dialog */}
      <AssignTicketDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        staff={staff}
        onAssign={handleAssignSubmit}
        ticketCategory={selectedTicket?.category}
      />
    </div>
  );
}