import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Staff } from '@/context/ticket-context';

interface AssignTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff[];
  onAssign: (staffId: string, scheduledDate: Date) => void;
  ticketCategory?: string;
}

export function AssignTicketDialog({
  open,
  onOpenChange,
  staff,
  onAssign,
  ticketCategory,
}: AssignTicketDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date>();

  // Filter available staff based on category if provided
  const availableStaff = staff.filter(member => 
    member.available && 
    (!ticketCategory || member.specialties.includes(ticketCategory as any))
  );

  const handleAssign = () => {
    if (selectedStaffId && scheduledDate) {
      onAssign(selectedStaffId, scheduledDate);
      onOpenChange(false);
      // Reset form
      setSelectedStaffId('');
      setScheduledDate(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Select a staff member and schedule the maintenance visit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Staff Member</label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.role} • {member.specialties.join(', ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule Date</label>
            <div className="rounded-md border">
              <CalendarComponent
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
          </div>

          {scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Scheduled for {format(scheduledDate, 'PPP')}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedStaffId || !scheduledDate}
          >
            Assign Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}