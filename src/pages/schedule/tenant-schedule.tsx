import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Building, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTickets } from '@/context/ticket-context';

export function TenantSchedule() {
  const { user } = useAuth();
  const { tickets } = useTickets();

  // Get user's tickets with scheduled maintenance
  const scheduledTickets = tickets
    .filter(t => 
      t.createdBy === user?.id && 
      t.scheduledDate &&
      new Date(t.scheduledDate) >= new Date()
    )
    .sort((a, b) => 
      new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedule</h1>
        <p className="text-muted-foreground">
          View your upcoming maintenance appointments
        </p>
      </div>

      <div className="space-y-8">
        {scheduledTickets.length > 0 ? (
          scheduledTickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{ticket.title}</CardTitle>
                    <CardDescription>
                      Ticket #{ticket.id.split('-')[1]}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tickets/${ticket.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(ticket.scheduledDate!), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(ticket.scheduledDate!), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {ticket.category}
                    </Badge>
                    <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}>
                      {ticket.priority}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>{ticket.description}</p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Unit {ticket.unitNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Scheduled Maintenance</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have any upcoming maintenance appointments.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/tickets/new">Request Service</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}