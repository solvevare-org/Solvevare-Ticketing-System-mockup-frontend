import { useState } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Circle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';

// Mock data for checklists
const MOCK_CHECKLISTS = [
  {
    id: '1',
    title: 'Daily Maintenance Checklist',
    description: 'Tasks to be completed daily',
    dueDate: new Date(),
    progress: 60,
    items: [
      { id: '1-1', title: 'Inspect common areas', completed: true },
      { id: '1-2', title: 'Check security systems', completed: true },
      { id: '1-3', title: 'Review maintenance requests', completed: true },
      { id: '1-4', title: 'Test emergency equipment', completed: false },
      { id: '1-5', title: 'Clean maintenance areas', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Weekly Equipment Inspection',
    description: 'Regular equipment maintenance checks',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    progress: 40,
    items: [
      { id: '2-1', title: 'HVAC system inspection', completed: true },
      { id: '2-2', title: 'Plumbing system check', completed: true },
      { id: '2-3', title: 'Electrical system review', completed: false },
      { id: '2-4', title: 'Safety equipment test', completed: false },
      { id: '2-5', title: 'Tool inventory check', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Monthly Safety Inspection',
    description: 'Comprehensive safety checks',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    progress: 20,
    items: [
      { id: '3-1', title: 'Fire safety inspection', completed: true },
      { id: '3-2', title: 'Emergency lighting check', completed: false },
      { id: '3-3', title: 'First aid supplies inventory', completed: false },
      { id: '3-4', title: 'Safety signage inspection', completed: false },
      { id: '3-5', title: 'Emergency exit review', completed: false },
    ],
  },
];

export function StaffChecklists() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [checklists, setChecklists] = useState(MOCK_CHECKLISTS);

  // Toggle item completion
  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const completedCount = updatedItems.filter(item => item.completed).length;
        const progress = Math.round((completedCount / updatedItems.length) * 100);
        
        return {
          ...checklist,
          items: updatedItems,
          progress,
        };
      }
      return checklist;
    }));
  };

  // Filter checklists based on completion
  const activeChecklists = checklists.filter(list => list.progress < 100);
  const completedChecklists = checklists.filter(list => list.progress === 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Checklists</h1>
        <p className="text-muted-foreground">
          Track and complete your maintenance tasks
        </p>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeChecklists.map((checklist) => (
            <Card key={checklist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{checklist.title}</CardTitle>
                    <CardDescription>{checklist.description}</CardDescription>
                  </div>
                  <Badge variant={checklist.progress >= 60 ? 'default' : 'destructive'}>
                    {checklist.progress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Due {format(checklist.dueDate, 'PPP')}</span>
                    </div>
                  </div>

                  <Progress value={checklist.progress} className="h-2" />

                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(checklist.id, item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className={`text-sm ${
                            item.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeChecklists.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You've completed all your checklists.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedChecklists.map((checklist) => (
            <Card key={checklist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{checklist.title}</CardTitle>
                    <CardDescription>{checklist.description}</CardDescription>
                  </div>
                  <Badge>Completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Completed on {format(checklist.dueDate, 'PPP')}</span>
                    </div>
                  </div>

                  <Progress value={100} className="h-2" />

                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox checked={true} disabled />
                        <label
                          className="text-sm line-through text-muted-foreground"
                        >
                          {item.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {completedChecklists.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Circle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Completed Checklists</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You haven't completed any checklists yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}