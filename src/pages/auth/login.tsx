import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ticket, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

// Form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Demo login info
const demoLogins = [
  { role: 'Tenant', email: 'tenant@example.com' },
  { role: 'Staff', email: 'staff@example.com' },
  { role: 'Manager', email: 'manager@example.com' },
];

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Welcome to the PPM Ticketing System',
        });
        navigate('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'An error occurred during login',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle demo login
  const handleDemoLogin = (email: string) => {
    form.setValue('email', email);
    form.setValue('password', 'password'); // Any password works for demo
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-primary p-3">
            <Ticket className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">PPM Ticketing</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:text-primary/90"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    {...form.register('password')}
                  />
                  <LockKeyhole className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="mt-6 space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Demo Accounts (use any password)
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {demoLogins.map((demo) => (
                    <Button
                      key={demo.role}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(demo.email)}
                    >
                      {demo.role}
                    </Button>
                  ))}
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}