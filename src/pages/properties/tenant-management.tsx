import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Building,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Home,
  Users,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for tenants
const MOCK_TENANTS = [
  {
    id: '1',
    name: 'Ernest Rrika',
    email: 'tenant@example.com',
    phone: '(555) 123-4567',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg',
    propertyId: 'prop-001',
    unitNumber: '101',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    status: 'active',
    rentAmount: 1500,
    lastPayment: '2024-01-01',
    maintenanceRequests: 3,
    property: {
      name: 'Sunset Valley Apartments',
      address: '123 Maple Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701'
    }
  },
  // Add more mock tenants as needed
];

// Mock data for properties
const MOCK_PROPERTIES = [
  {
    id: 'prop-001',
    name: 'Sunset Valley Apartments',
    address: '123 Maple Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    units: 50,
    occupiedUnits: 45,
    maintenanceRequests: 8,
    averageRent: 1500
  },
  // Add more mock properties as needed
];

export function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [tab, setTab] = useState('tenants');

  // Filter tenants based on search and filters
  const filteredTenants = MOCK_TENANTS.filter(tenant => {
    const matchesSearch = searchTerm === '' ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unitNumber.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || tenant.propertyId === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
        <p className="text-muted-foreground">
          Manage tenants and property details
        </p>
      </div>

      <Tabs defaultValue="tenants" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tenants..."
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Property</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {MOCK_PROPERTIES.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenants List */}
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:bg-accent/5 transition-colors">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tenant.avatar} />
                        <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{tenant.name}</CardTitle>
                        <CardDescription>Unit {tenant.unitNumber}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={`/properties/tenants/${tenant.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{tenant.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <span>{tenant.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lease Period</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(tenant.leaseStart).toLocaleDateString()} -
                          {new Date(tenant.leaseEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge>{tenant.status}</Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Property</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Building className="h-4 w-4" />
                        <span>{tenant.property.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tenant.property.address}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Home className="h-4 w-4" />
                        <span>${tenant.rentAmount}/month</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{tenant.maintenanceRequests} maintenance requests</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          {/* Properties List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_PROPERTIES.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                  <CardDescription>{property.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Occupancy</div>
                      <div className="font-medium">
                        {property.occupiedUnits}/{property.units} units
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Average Rent</div>
                      <div className="font-medium">${property.averageRent}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Maintenance</div>
                      <div className="font-medium">{property.maintenanceRequests} requests</div>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link to={`/properties/${property.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}