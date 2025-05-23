import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format, startOfWeek, addDays } from 'date-fns';
import { Calendar, Clock, Building, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useTickets } from '@/context/ticket-context';

export function StaffSchedule() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [tab, setTab] = useState('upcoming');

  // Get staff's assigned tickets
  const assignedTickets = tickets.filter(t => t.assignedTo === user?.id);

  // Get upcoming scheduled maintenance
  const upcomingTickets = assignedTickets
    .filter(t => 
      t.scheduledDate &&
      new Date(t.scheduledDate) >= new Date() &&
      !['resolved', 'closed'].includes(t.status)
    )
    .sort((a, b) => 
      new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
    );

  // Get deadlines (tickets that are urgent or past due)
  const deadlines = assignedTickets
    .filter(t => 
      (t.priority === 'urgent' || 
      (t.scheduledDate && new Date(t.scheduledDate) < new Date())) &&
      !['resolved', 'closed'].includes(t.status)
    )
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Get weekly schedule
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklySchedule = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startOfCurrentWeek, index);
    return {
      date,
      tickets: upcomingTickets.filter(ticket => {
        const scheduleDate = new Date(ticket.scheduledDate!);
        return (
          scheduleDate.getDate() === date.getDate() &&
          scheduleDate.getMonth() === date.getMonth() &&
          scheduleDate.getFullYear() === date.getFullYear()
        );
      }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Schedule</h1>
        <p className="text-muted-foreground">
          View your upcoming maintenance tasks and deadlines
        </p>
      </div>

      <Tabs defaultValue="upcoming" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        </TabsList>

        {/* Upcoming Tasks */}
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingTickets.length > 0 ? (
            upcomingTickets.map((ticket) => (
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
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Upcoming Tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any upcoming maintenance tasks scheduled.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Weekly Schedule */}
        <TabsContent value="weekly" className="space-y-6">
          {weeklySchedule.map(({ date, tickets }) => (
            <Card key={date.toISOString()}>
              <CardHeader>
                <CardTitle>{format(date, 'EEEE, MMMM d')}</CardTitle>
                <CardDescription>
                  {tickets.length} {tickets.length === 1 ? 'task' : 'tasks'} scheduled
                </CardDescription>
              </CardHeader>
              {tickets.length > 0 && (
                <CardContent className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{ticket.title}</span>
                          <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(ticket.scheduledDate!), 'h:mm a')}</span>
                          <span>•</span>
                          <Building className="h-4 w-4" />
                          <span>Unit {ticket.unitNumber}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/tickets/${ticket.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* Deadlines */}
        <TabsContent value="deadlines" className="space-y-6">
          {deadlines.length > 0 ? (
            deadlines.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle>{ticket.title}</CardTitle>
                        <Badge variant="destructive">
                          {ticket.priority === 'urgent' ? 'Urgent' : 'Past Due'}
                        </Badge>
                      </div>
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
                    {ticket.scheduledDate && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-destructive">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            Due {formatDistanceToNow(new Date(ticket.scheduledDate), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {ticket.category}
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
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Urgent Tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any urgent or overdue tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}