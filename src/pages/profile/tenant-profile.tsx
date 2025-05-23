import { Building, Mail, MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

// Mock data for the tenant's property details
const propertyDetails = {
  name: "Sunset Valley Apartments",
  address: "123 Maple Street",
  city: "Springfield",
  state: "IL",
  zip: "62701",
  phone: "(555) 123-4567",
  email: "info@sunsetvalley.com"
};

export function TenantProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view property details
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
                <AvatarFallback>{user?.name?.charAt(0) || 'T'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <Badge>Tenant</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Unit {user?.unitNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>
              Details about your residential property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{propertyDetails.name}</h3>
              <Badge variant="outline">Residential Complex</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Property ID: {user?.propertyId}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <p>{propertyDetails.address}</p>
                  <p>{propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{propertyDetails.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{propertyDetails.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}