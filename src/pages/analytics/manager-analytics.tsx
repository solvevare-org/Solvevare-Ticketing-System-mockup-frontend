import { useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTickets } from '@/context/ticket-context';

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

export function ManagerAnalytics() {
  const { tickets } = useTickets();
  const [timeRange, setTimeRange] = useState('30');
  const [tab, setTab] = useState('overview');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Detailed insights and performance metrics
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTickets}</div>
                <div className="text-xs text-muted-foreground">
                  +{monthlyData[monthlyData.length - 1].tickets} today
                </div>
                <div className="mt-4 h-2">
                  <Progress value={65} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(resolutionRate)}%</div>
                <div className="text-xs text-muted-foreground">
                  {resolvedTickets.length} tickets resolved
                </div>
                <div className="mt-4 h-2">
                  <Progress value={resolutionRate} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgResolutionTime} hrs</div>
                <div className="text-xs text-muted-foreground">
                  Target: 24 hours
                </div>
                <div className="mt-4 h-2">
                  <Progress value={(24 / avgResolutionTime) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5.0</div>
                <div className="text-xs text-muted-foreground">
                  Based on {ticketsWithFeedback.length} ratings
                </div>
                <div className="mt-4 h-2">
                  <Progress value={(avgSatisfaction / 5) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Volume Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Trend</CardTitle>
              <CardDescription>
                Daily ticket volume over the past {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <div className="h-full w-full">
                  <div className="flex h-full items-end gap-2">
                    {monthlyData.slice(-Number(timeRange)).map((_, i) => {
                      const height = (monthlyData[i].tickets / 10) * 100;
                      return (
                        <div key={i} className="relative flex-1">
                          <div
                            className="bg-primary/20 rounded-t"
                            style={{ height: `${height}%` }}
                          >
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-primary rounded-t"
                              style={{ height: `${(monthlyData[i].resolved / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{format(monthlyData[0].date, 'MMM d')}</span>
                <span>{format(monthlyData[monthlyData.length - 1].date, 'MMM d')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Breakdown of tickets by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, count]) => {
                    const percentage = (count / totalTickets) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground">{count} tickets</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>
                  Average response time by priority
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['urgent', 'high', 'medium', 'low'].map((priority) => {
                    const responseTime = Math.floor(Math.random() * 24) + 1;
                    const target = priority === 'urgent' ? 2 : priority === 'high' ? 4 : priority === 'medium' ? 8 : 24;
                    const percentage = Math.min((target / responseTime) * 100, 100);
                    
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={priority === 'urgent' ? 'destructive' : 'default'} className="capitalize">
                              {priority}
                            </Badge>
                            <span className="text-sm">{responseTime} hours</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Target: {target}h</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {/* Ticket Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Distribution</CardTitle>
              <CardDescription>
                Current distribution of tickets by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {['new', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed'].map((status) => {
                  const count = tickets.filter(t => t.status === status).length;
                  const percentage = (count / totalTickets) * 100;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{status}</Badge>
                        <span className="text-sm text-muted-foreground">{count} tickets</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resolution Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Trends</CardTitle>
              <CardDescription>
                Average time to resolve tickets over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <div className="h-full w-full">
                  <div className="flex h-full items-end gap-2">
                    {monthlyData.slice(-Number(timeRange)).map((_, i) => {
                      const height = Math.random() * 80 + 20;
                      return (
                        <div key={i} className="relative flex-1">
                          <div
                            className="bg-primary rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property-wise Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Property-wise Analysis</CardTitle>
              <CardDescription>
                Ticket distribution across properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => {
                  const propertyTickets = Math.floor(Math.random() * 50) + 10;
                  const resolvedCount = Math.floor(Math.random() * propertyTickets);
                  const percentage = (resolvedCount / propertyTickets) * 100;
                  
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Property {i + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            {propertyTickets} tickets • {resolvedCount} resolved
                          </p>
                        </div>
                        <Badge variant={percentage >= 80 ? 'default' : 'outline'}>
                          {percentage.toFixed(0)}% resolved
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Metrics</CardTitle>
              <CardDescription>
                Individual staff member performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => {
                  const assignedTickets = Math.floor(Math.random() * 30) + 10;
                  const resolvedTickets = Math.floor(Math.random() * assignedTickets);
                  const avgResolutionTime = Math.floor(Math.random() * 24) + 1;
                  const satisfaction = (Math.random() * 2 + 3).toFixed(1);
                  
                  return (
                    <div key={i} className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Staff Member {i + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            {assignedTickets} assigned • {resolvedTickets} resolved
                          </p>
                        </div>
                        <Badge variant="outline">
                          {((resolvedTickets / assignedTickets) * 100).toFixed(0)}% completion
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Resolution Time</p>
                          <div className="font-medium">{avgResolutionTime} hours</div>
                          <Progress 
                            value={Math.min((24 / avgResolutionTime) * 100, 100)} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Satisfaction</p>
                          <div className="font-medium">{satisfaction}/5.0</div>
                          <Progress 
                            value={(Number(satisfaction) / 5) * 100} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Workload</p>
                          <div className="font-medium">{assignedTickets} tickets</div>
                          <Progress 
                            value={(assignedTickets / 30) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SLA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance</CardTitle>
              <CardDescription>
                Service Level Agreement performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Response Time', 'Resolution Time', 'First Contact Resolution'].map((metric) => {
                  const compliance = Math.floor(Math.random() * 20 + 80);
                  const trend = Math.random() > 0.5;
                  
                  return (
                    <div key={metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{metric}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={compliance >= 90 ? 'default' : 'outline'}>
                            {compliance}%
                          </Badge>
                          {trend ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Progress value={compliance} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        Target: 90% • Current: {compliance}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Key quality indicators and customer satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Customer Satisfaction Breakdown</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = Math.floor(Math.random() * 50);
                      const percentage = (count / 100) * 100;
                      
                      return (
                        <div key={rating} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span>{rating} stars</span>
                              <span className="text-muted-foreground">({count})</span>
                            </div>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Reopened Tickets</h4>
                  <div className="space-y-4">
                    {['This Week', 'Last Week', 'This Month'].map((period) => {
                      const reopened = Math.floor(Math.random() * 5);
                      const total = Math.floor(Math.random() * 50) + 20;
                      const percentage = (reopened / total) * 100;
                      
                      return (
                        <div key={period} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{period}</span>
                            <Badge variant={percentage <= 5 ? 'default' : 'destructive'}>
                              {reopened} reopened
                            </Badge>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of {total} tickets
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Cost Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  For the past {timeRange} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cost/Ticket</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round(totalCost / totalTickets).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {totalTickets} tickets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <Progress value={78} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Of monthly budget
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Trend</CardTitle>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">-12%</div>
                <p className="text-xs text-muted-foreground">
                  Compared to last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>
                Daily maintenance costs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <div className="h-full w-full">
                  <div className="flex h-full items-end gap-2">
                    {monthlyData.slice(-Number(timeRange)).map((_, i) => {
                      const height = (monthlyData[i].cost / 500) * 100;
                      return (
                        <div key={i} className="relative flex-1">
                          <div
                            className="bg-primary rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{format(monthlyData[0].date, 'MMM d')}</span>
                <span>{format(monthlyData[monthlyData.length - 1].date, 'MMM d')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Costs by Category</CardTitle>
              <CardDescription>
                Maintenance costs broken down by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const categoryCost = Math.floor(Math.random() * 5000) + 1000;
                  const percentage = (categoryCost / totalCost) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className="text-sm">${categoryCost.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% of total costs</span>
                        <span>Avg ${Math.round(categoryCost / count)} per ticket</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Budget Planning */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Planning</CardTitle>
              <CardDescription>
                Monthly budget allocation and utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Emergency Repairs', 'Preventive Maintenance', 'Equipment Replacement', 'General Maintenance'].map((category) => {
                  const allocated = Math.floor(Math.random() * 10000) + 5000;
                  const used = Math.floor(Math.random() * allocated);
                  const percentage = (used / allocated) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{category}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${used.toLocaleString()} of ${allocated.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={percentage > 90 ? 'destructive' : 'outline'}>
                          {percentage.toFixed(0)}% used
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                View Detailed Budget Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}