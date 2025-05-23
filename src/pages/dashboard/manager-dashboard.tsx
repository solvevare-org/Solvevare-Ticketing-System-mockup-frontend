import { useState } from 'react';
import { Link } from 'react-router-dom';
import { subDays } from 'date-fns';
import {
  BarChart as BarChartIcon,
  DollarSign,
  Users,
  Building,
  ArrowRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AssignTicketDialog } from '@/components/tickets/assign-ticket-dialog';
import { useAuth } from '@/context/auth-context';
import { useTickets, TicketCategory } from '@/context/ticket-context';
import { useToast } from '@/hooks/use-toast';

// Mock data for charts
const generateMockData = (days: number) => {
  return Array.from({ length: days }).map((_, i) => ({
    date: subDays(new Date(), days - 1 - i),
    tickets: Math.floor(Math.random() * 10) + 1,
    resolved: Math.floor(Math.random() * 8) + 1,
    cost: Math.floor(Math.random() * 500) + 100,
  }));
};

const monthlyData = generateMockData(30);

export function ManagerDashboard() {
  const { user } = useAuth();
  const { tickets, staff, assignTicket } = useTickets();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30');
  const [tab, setTab] = useState('overview');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    title: string;
    category: TicketCategory;
  } | null>(null);

  // Calculate statistics
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status));
  const resolutionRate = (resolvedTickets.length / totalTickets) * 100;
  const avgResolutionTime = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const completed = new Date(ticket.completedDate || ticket.updatedAt).getTime();
        return sum + (completed - created) / (1000 * 60 * 60);
      }, 0) / resolvedTickets.length)
    : 0;

  // Calculate category distribution
  const categoryStats = tickets.reduce((acc: Record<string, number>, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate total cost
  const totalCost = tickets
    .filter(t => t.cost)
    .reduce((sum, ticket) => sum + (ticket.cost || 0), 0);

  // Calculate customer satisfaction
  const ticketsWithFeedback = tickets.filter(t => t.feedback);
  const avgSatisfaction = ticketsWithFeedback.length > 0
    ? ticketsWithFeedback.reduce((sum, t) => sum + (t.feedback?.rating || 0), 0) / ticketsWithFeedback.length
    : 0;

  // Handle assignment
  const handleAssign = (task: { title: string; category: TicketCategory }) => {
    setSelectedTask(task);
    setAssignDialogOpen(true);
  };

  // Handle assignment submission
  const handleAssignSubmit = (staffId: string, scheduledDate: Date) => {
    if (!selectedTask) return;

    assignTicket(staffId, scheduledDate.toISOString());

    toast({
      title: 'Task assigned',
      description: 'The maintenance task has been assigned successfully.',
    });

    setAssignDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/analytics">
              <BarChartIcon className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link to="/tickets">
              View All Tickets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(resolutionRate)}%</div>
                <p className="text-xs text-muted-foreground">
                  {resolvedTickets.length} tickets resolved
                </p>
                <div className="mt-2">
                  <Progress value={resolutionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgResolutionTime} hrs</div>
                <p className="text-xs text-muted-foreground">
                  Average time to resolve tickets
                </p>
                <div className="mt-2">
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total maintenance expenses
                </p>
                <div className="mt-2">
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(avgSatisfaction * 100)}%</div>
                <p className="text-xs text-muted-foreground">
                  Based on {ticketsWithFeedback.length} responses
                </p>
                <div className="mt-2">
                  <Progress value={avgSatisfaction * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ticket Activity</CardTitle>
                  <CardDescription>
                    Ticket volume over time
                  </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end gap-2">
                {monthlyData.slice(-parseInt(timeRange)).map((day, i) => {
                  const height = (day.tickets / 10) * 100;
                  return (
                    <div
                      key={i}
                      className="bg-primary/15 group relative flex-1 rounded-md hover:bg-primary/30 transition-all"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-primary h-[30%] rounded-md"></div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow">
                        {day.tickets} tickets
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>
                Tickets by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const percentage = (count / totalTickets) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-medium">{count} tickets</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Average staff utilization rate
                </p>
                <div className="mt-2">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 hrs</div>
                <p className="text-xs text-muted-foreground">
                  Average initial response time
                </p>
                <div className="mt-2">
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  Tasks completed on schedule
                </p>
                <div className="mt-2">
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.5/5</div>
                <p className="text-xs text-muted-foreground">
                  Average quality rating
                </p>
                <div className="mt-2">
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>
                Individual staff member metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Staff Member</th>
                      <th className="h-10 px-4 text-left font-medium">Assigned</th>
                      <th className="h-10 px-4 text-left font-medium">Completed</th>
                      <th className="h-10 px-4 text-left font-medium">Avg. Time</th>
                      <th className="h-10 px-4 text-left font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle">{member.name}</td>
                        <td className="p-4 align-middle">
                          {tickets.filter(t => t.assignedTo === member.id).length}
                        </td>
                        <td className="p-4 align-middle">
                          {tickets.filter(t => 
                            t.assignedTo === member.id && 
                            ['resolved', 'closed'].includes(t.status)
                          ).length}
                        </td>
                        <td className="p-4 align-middle">
                          {Math.floor(10 + Math.random() * 15)} hrs
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <div className="w-24 bg-muted rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${70 + Math.random() * 25}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{(3.5 + Math.random() * 1.4).toFixed(1)}/5</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Tasks requiring attention in the coming days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Annual HVAC Inspection',
                    dueDate: 'Due Tomorrow',
                    category: 'hvac' as TicketCategory,
                    description: 'Schedule annual HVAC system inspection for all properties',
                    type: 'Required'
                  },
                  {
                    title: 'Fire Safety Compliance',
                    dueDate: 'Due in 3 days',
                    category: 'structural' as TicketCategory,
                    description: 'Complete fire safety compliance documentation',
                    type: 'Regulatory'
                  },
                  {
                    title: 'Quarterly Pest Control',
                    dueDate: 'Due next week',
                    category: 'pest' as TicketCategory,
                    description: 'Coordinate quarterly pest control treatment',
                    type: 'Maintenance'
                  }
                ].map((task, i) => (
                  <div key={i} className="flex items-start space-x-4 border rounded-lg p-4">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={i === 0 ? "destructive" : "secondary"}>
                          {task.dueDate}
                        </Badge>
                        <Badge variant="outline">{task.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAssign({
                        title: task.title,
                        category: task.category
                      })}
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          {/* Finance Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total maintenance costs
                </p>
                <div className="mt-2">
                  <Progress value={65} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  65% of monthly budget used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Cost Per Ticket</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${resolvedTickets.length ? Math.round(totalCost / resolvedTickets.length).toLocaleString() : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average maintenance cost per ticket
                </p>
                <div className="mt-2">
                  <Progress value={75} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  25% below target benchmark
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendor Expenses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(totalCost * 0.65).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  External vendor costs
                </p>
                <div className="mt-2">
                  <Progress value={65} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  65% of total maintenance expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  Regulatory compliance rate
                </p>
                <div className="mt-2">
                  <Progress value={98} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  2 items requiring attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Maintenance costs by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const cost = Math.round(totalCost * (count / tickets.length));
                  const percentage = Math.round((count / tickets.length) * 100);
                  
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-medium">${cost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/finance">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Financial Reports
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                Recently completed work and associated costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Ticket</th>
                      <th className="h-10 px-4 text-left font-medium">Category</th>
                      <th className="h-10 px-4 text-left font-medium">Completed</th>
                      <th className="h-10 px-4 text-left font-medium">Cost</th>
                      <th className="h-10 px-4 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedTickets.slice(0, 5).map((ticket) => (
                      <tr key={ticket.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle">
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-xs text-muted-foreground">Unit {ticket.unitNumber}</div>
                        </td>
                        <td className="p-4 align-middle capitalize">{ticket.category}</td>
                        <td className="p-4 align-middle">
                          {new Date(ticket.completedDate || ticket.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          ${ticket.cost?.toLocaleString() || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/tickets/${ticket.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      {selectedTask && (
        <AssignTicketDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          staff={staff}
          onAssign={handleAssignSubmit}
          ticketCategory={selectedTask.category}
        />
      )}
    </div>
  );
}