import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { LineChart, TrendingUp, TrendingDown, DollarSign, Calendar, Download, FileText, Filter, ArrowUpDown, Building, PenTool, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTickets } from '@/context/ticket-context';

// Generate mock financial data
const generateMonthlyData = (months: number) => {
  return Array.from({ length: months }).map((_, i) => {
    const date = subMonths(new Date(), i);
    return {
      month: format(date, 'MMMM yyyy'),
      maintenance: Math.floor(Math.random() * 5000) + 3000,
      repairs: Math.floor(Math.random() * 4000) + 2000,
      supplies: Math.floor(Math.random() * 2000) + 1000,
      labor: Math.floor(Math.random() * 6000) + 4000,
    };
  }).reverse();
};

const monthlyData = generateMonthlyData(12);

// Calculate totals and trends
const calculateTotals = (data: typeof monthlyData) => {
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  
  const currentTotal = currentMonth.maintenance + currentMonth.repairs + 
    currentMonth.supplies + currentMonth.labor;
  const previousTotal = previousMonth.maintenance + previousMonth.repairs + 
    previousMonth.supplies + previousMonth.labor;
  
  const percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  
  return {
    currentTotal,
    previousTotal,
    percentageChange,
  };
};

export function FinanceReports() {
  const { tickets } = useTickets();
  const [timeRange, setTimeRange] = useState('12');
  const [tab, setTab] = useState('overview');
  
  const totals = calculateTotals(monthlyData);

  // Calculate category expenses
  const categoryExpenses = tickets.reduce((acc: Record<string, number>, ticket) => {
    if (ticket.cost && ticket.category) {
      acc[ticket.category] = (acc[ticket.category] || 0) + ticket.cost;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <p className="text-muted-foreground">
          Detailed financial analysis and expense tracking
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
            <SelectItem value="24">Last 24 months</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totals.currentTotal.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {totals.percentageChange >= 0 ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span>
                    {Math.abs(totals.percentageChange).toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <Progress value={78} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  $22,000 remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost per Unit</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$342</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                  <span>8.3% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Labor Costs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,850</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                  <span>12.5% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expense Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>
                Expense breakdown by category over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <div className="h-full w-full">
                  <div className="flex h-full items-end gap-2">
                    {monthlyData.slice(-Number(timeRange)).map((month, i) => {
                      const total = month.maintenance + month.repairs + 
                        month.supplies + month.labor;
                      const height = (total / 15000) * 100;
                      return (
                        <div key={i} className="relative flex-1">
                          <div
                            className="bg-primary/20 rounded-t"
                            style={{ height: `${height}%` }}
                          >
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-primary rounded-t"
                              style={{ height: `${(month.maintenance / total) * height}%` }}
                            />
                          </div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                            {format(new Date(month.month), 'MMM')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Breakdown of expenses by maintenance category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryExpenses).map(([category, cost]) => {
                  const percentage = (cost / Object.values(categoryExpenses)
                    .reduce((a, b) => a + b, 0)) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PenTool className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-medium">${cost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="h-2" />
                        <span className="text-xs text-muted-foreground w-12">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {/* Detailed Expenses Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Details</CardTitle>
                  <CardDescription>
                    Detailed breakdown of all maintenance expenses
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Category</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repairs">Repairs</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="date-desc">
                    <SelectTrigger className="w-[130px]">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <span>Sort By</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Latest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="amount-desc">Highest Amount</SelectItem>
                      <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Date</th>
                      <th className="h-10 px-4 text-left font-medium">Description</th>
                      <th className="h-10 px-4 text-left font-medium">Category</th>
                      <th className="h-10 px-4 text-left font-medium">Amount</th>
                      <th className="h-10 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets
                      .filter(t => t.cost)
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 10)
                      .map((ticket) => (
                        <tr key={ticket.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            {format(new Date(ticket.updatedAt), 'MMM d, yyyy')}
                          </td>
                          <td className="p-4">{ticket.title}</td>
                          <td className="p-4 capitalize">{ticket.category}</td>
                          <td className="p-4">${ticket.cost?.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge variant={ticket.status === 'closed' ? 'default' : 'outline'}>
                              {ticket.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Download Detailed Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>
                Current budget allocation and utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { category: 'Emergency Repairs', allocated: 25000, used: 18500 },
                  { category: 'Preventive Maintenance', allocated: 35000, used: 28000 },
                  { category: 'Equipment Replacement', allocated: 20000, used: 12000 },
                  { category: 'Supplies & Materials', allocated: 15000, used: 11000 },
                  { category: 'Labor & Contractors', allocated: 45000, used: 38000 },
                ].map((item) => {
                  const percentage = (item.used / item.allocated) * 100;
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.used.toLocaleString()} of ${item.allocated.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={percentage > 90 ? 'destructive' : 'outline'}>
                          {percentage.toFixed(0)}% used
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${(item.allocated - item.used).toLocaleString()} remaining</span>
                        <span>{Math.round((item.allocated - item.used) / (item.allocated / 12))} months at current rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          {/* Expense Forecasting */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Forecasting</CardTitle>
              <CardDescription>
                Projected maintenance expenses for the next 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { quarter: 'Q1 2024', projected: 85000, confidence: 'high' },
                  { quarter: 'Q2 2024', projected: 92000, confidence: 'medium' },
                  { quarter: 'Q3 2024', projected: 78000, confidence: 'medium' },
                  { quarter: 'Q4 2024', projected: 88000, confidence: 'low' },
                ].map((forecast) => (
                  <div key={forecast.quarter} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{forecast.quarter}</h4>
                        <p className="text-sm text-muted-foreground">
                          Projected: ${forecast.projected.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        forecast.confidence === 'high' ? 'default' :
                        forecast.confidence === 'medium' ? 'secondary' : 'outline'
                      }>
                        {forecast.confidence} confidence
                      </Badge>
                    </div>
                    <div className="h-24 bg-muted/30 rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LineChart className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Based on historical data</span>
                      <span>Updated monthly</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}