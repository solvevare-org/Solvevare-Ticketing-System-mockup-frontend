import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTickets } from '@/context/ticket-context';

// Mock data for staff contact details and additional information
const staffDetails = {
  '2': {
    phone: '(555) 123-4567',
    email: 'staff@example.com',
    startDate: '2023-01-15',
    certification: ['HVAC Certified', 'Licensed Electrician'],
    availability: 'Full-time',
    schedule: 'Mon-Fri, 9AM-5PM',
    emergencyContact: {
      name: 'Jane Rodriguez',
      relation: 'Spouse',
      phone: '(555) 987-6543'
    }
  }
};

export function StaffList() {
  const { tickets, staff } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  // Calculate staff performance metrics
  const getStaffMetrics = (staffId: string) => {
    const staffTickets = tickets.filter(t => t.assignedTo === staffId);
    const completedTickets = staffTickets.filter(t => 
      ['resolved', 'closed'].includes(t.status)
    );
    const ticketsWithFeedback = completedTickets.filter(t => t.feedback);
    
    return {
      totalAssigned: staffTickets.length,
      completed: completedTickets.length,
      avgResolutionTime: completedTickets.length > 0
        ? Math.round(completedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt).getTime();
            const completed = new Date(ticket.completedDate || ticket.updatedAt).getTime();
            return sum + (completed - created) / (1000 * 60 * 60);
          }, 0) / completedTickets.length)
        : 0,
      avgRating: ticketsWithFeedback.length > 0
        ? ticketsWithFeedback.reduce((sum, t) => sum + (t.feedback?.rating || 0), 0) / ticketsWithFeedback.length
        : 0,
      currentLoad: staffTickets.filter(t => 
        !['resolved', 'closed'].includes(t.status)
      ).length
    };
  };

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchTerm === '' ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role.includes(filterRole);
    const matchesSpecialty = filterSpecialty === 'all' || 
      member.specialties.includes(filterSpecialty as any);
    
    return matchesSearch && matchesRole && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage staff members and track their performance
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Role</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Specialty</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="pest">Pest Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="space-y-6">
        {filteredStaff.map((member) => {
          const metrics = getStaffMetrics(member.id);
          const details = staffDetails[member.id as keyof typeof staffDetails];

          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center space-x-2">
                          <Badge>{member.role}</Badge>
                          <Badge variant="outline">
                            {details?.availability || 'Full-time'}
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline">View Schedule</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Current Load
                          </CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.currentLoad}</div>
                          <p className="text-xs text-muted-foreground">
                            Active assignments
                          </p>
                          <Progress 
                            value={(metrics.currentLoad / 10) * 100} 
                            className="h-2 mt-2" 
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Completion Rate
                          </CardTitle>
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {metrics.totalAssigned ? 
                              `${Math.round((metrics.completed / metrics.totalAssigned) * 100)}%` : 
                              'N/A'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.completed} of {metrics.totalAssigned} completed
                          </p>
                          <Progress 
                            value={metrics.totalAssigned ? 
                              (metrics.completed / metrics.totalAssigned) * 100 : 0
                            } 
                            className="h-2 mt-2" 
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Avg. Resolution Time
                          </CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.avgResolutionTime}h</div>
                          <p className="text-xs text-muted-foreground">
                            Average time to resolve
                          </p>
                          <Progress 
                            value={Math.min((24 / metrics.avgResolutionTime) * 100, 100)} 
                            className="h-2 mt-2" 
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Customer Rating
                          </CardTitle>
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.avgRating.toFixed(1)}</div>
                          <div className="flex mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(metrics.avgRating)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <Progress 
                            value={(metrics.avgRating / 5) * 100} 
                            className="h-2 mt-2" 
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance">
                    <div className="space-y-4">
                      {/* Specialties and Skills */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Specialties</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {member.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Certifications</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {details?.certification.map((cert) => (
                                <Badge key={cert} variant="outline">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Performance */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Recent Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {tickets
                              .filter(t => t.assignedTo === member.id)
                              .sort((a, b) => 
                                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                              )
                              .slice(0, 5)
                              .map((ticket) => (
                                <div key={ticket.id} className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{ticket.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{ticket.status}</Badge>
                                    {ticket.feedback && (
                                      <div className="flex">
                                        {Array.from({ length: ticket.feedback.rating }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className="h-4 w-4 text-yellow-500 fill-yellow-500"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{details?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{details?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Started {formatDistanceToNow(new Date(details?.startDate || ''), { addSuffix: true })}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Schedule & Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{details?.schedule}</span>
                          </div>
                          <div>
                            <p className="font-medium mb-2">Emergency Contact</p>
                            <div className="space-y-1 text-sm">
                              <p>{details?.emergencyContact.name}</p>
                              <p className="text-muted-foreground">{details?.emergencyContact.relation}</p>
                              <p>{details?.emergencyContact.phone}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}

        {filteredStaff.length === 0 && (
          <Card className="py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No staff members found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}