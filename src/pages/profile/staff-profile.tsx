import { Building, Mail, MapPin, Phone, User, Wrench, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { useTickets } from '@/context/ticket-context';

// Mock data for staff performance
const performanceStats = {
  completionRate: 92,
  responseTime: 4.2,
  customerSatisfaction: 4.8,
  tasksCompleted: 156,
};

export function StaffProfile() {
  const { user } = useAuth();
  const { tickets } = useTickets();

  // Calculate assigned tickets
  const assignedTickets = tickets.filter(t => t.assignedTo === user?.id);
  const completedTickets = assignedTickets.filter(t => 
    ['resolved', 'closed'].includes(t.status)
  );

  // Calculate average rating
  const ticketsWithFeedback = completedTickets.filter(t => t.feedback);
  const averageRating = ticketsWithFeedback.length > 0
    ? ticketsWithFeedback.reduce((sum, ticket) => sum + (ticket.feedback?.rating || 0), 0) / ticketsWithFeedback.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View your profile and performance metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your account details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <Badge>Maintenance Staff</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Maintenance Technician</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Property ID: {user?.propertyId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Your work performance statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Task Completion Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Task Completion Rate</span>
                <span className="font-medium">{performanceStats.completionRate}%</span>
              </div>
              <Progress value={performanceStats.completionRate} className="h-2" />
            </div>

            {/* Average Response Time */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Response Time</span>
                <span className="font-medium">{performanceStats.responseTime} hours</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>

            {/* Customer Satisfaction */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Customer Satisfaction</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{averageRating.toFixed(1)}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(averageRating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Progress 
                value={(averageRating / 5) * 100} 
                className="h-2" 
              />
            </div>

            {/* Tasks Completed */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {completedTickets.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Completed
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {assignedTickets.filter(t => 
                      !['resolved', 'closed'].includes(t.status)
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks in Progress
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}