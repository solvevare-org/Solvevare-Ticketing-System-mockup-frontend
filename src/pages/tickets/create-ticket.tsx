import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, XCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useTickets, TicketCategory, TicketPriority } from '@/context/ticket-context';

// Form schema
const createTicketSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.enum(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other'] as const),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

export function CreateTicket() {
  const { user } = useAuth();
  const { addTicket } = useTickets();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // Form setup
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
    },
  });

  // Handle form submission
  const onSubmit = (values: CreateTicketFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication error',
        description: 'You must be logged in to create a ticket',
      });
      return;
    }

    setIsLoading(true);

    try {
      addTicket({
        title: values.title,
        description: values.description,
        category: values.category as TicketCategory,
        priority: values.priority as TicketPriority,
        createdBy: user.id,
        propertyId: user.propertyId || 'prop-001',
        unitNumber: user.unitNumber || '101',
        images: images.length > 0 ? images : undefined,
      });

      toast({
        title: 'Service request submitted',
        description: 'Your request has been submitted successfully',
      });

      navigate('/tickets');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create service request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // In a real implementation, we would upload these to a server
    // For this demo, we'll just create data URLs
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Service Request</h1>
        <p className="text-muted-foreground">
          Submit a new maintenance or service request for your property
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Issue Title</Label>
          <Input 
            id="title"
            placeholder="Briefly describe your issue"
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description</Label>
          <Textarea 
            id="description"
            placeholder="Provide more details about your issue..."
            className="min-h-[120px]"
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              defaultValue={form.getValues('category')}
              onValueChange={(value) => form.setValue('category', value as TicketCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="structural">Structural</SelectItem>
                <SelectItem value="pest">Pest Control</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup 
              defaultValue={form.getValues('priority')}
              onValueChange={(value) => form.setValue('priority', value as TicketPriority)}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-sm cursor-pointer">Low</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-sm cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-sm cursor-pointer">High</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent" className="text-sm cursor-pointer">Urgent</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.priority && (
              <p className="text-sm text-destructive">{form.formState.errors.priority.message}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Photos or Videos (Optional)</Label>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="image-upload" 
                className="w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors p-6"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or MP4 (max. 10MB)
                  </p>
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Card className="overflow-hidden h-24">
                      <img src={image} alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
                    </Card>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Submitting...' : 'Submit Service Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}