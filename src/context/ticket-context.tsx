import { createContext, useContext, useState, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Ticket types
export type TicketStatus = 'new' | 'assigned' | 'in-progress' | 'on-hold' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  propertyId: string;
  unitNumber?: string;
  images?: string[];
  scheduledDate?: string;
  completedDate?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
  notes?: TicketNote[];
  cost?: number;
}

// Ticket note interface
export interface TicketNote {
  id: string;
  ticketId: string;
  createdBy: string;
  createdAt: string;
  text: string;
  isPrivate: boolean;
}

// Mock staff/vendors for assignment
export interface Staff {
  id: string;
  name: string;
  role: string;
  specialties: TicketCategory[];
  available: boolean;
  avatar?: string;
}

// Create mock tickets
const generateMockTickets = (): Ticket[] => {
  const categories: TicketCategory[] = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other'];
  const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: TicketStatus[] = ['new', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed'];
  
  const mockTickets: Ticket[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const ticket: Ticket = {
      id: `ticket-${i}`,
      title: `Issue with ${categories[Math.floor(Math.random() * categories.length)]} system`,
      description: `Having problems with my ${categories[Math.floor(Math.random() * categories.length)]} system. Please fix as soon as possible.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1', // Tenant ID
      propertyId: 'prop-001',
      unitNumber: `${100 + Math.floor(Math.random() * 50)}`,
      images: i % 3 === 0 ? ['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg'] : undefined,
    };
    
    // Add resolved info for closed tickets
    if (status === 'resolved' || status === 'closed') {
      ticket.assignedTo = '2'; // Sam Rodriguez's ID
      ticket.completedDate = new Date().toISOString();
      
      if (Math.random() > 0.5) {
        ticket.feedback = {
          rating: 1 + Math.floor(Math.random() * 5),
          comment: Math.random() > 0.5 ? 'Great service, thank you!' : undefined,
        };
      }
      
      ticket.cost = Math.floor(Math.random() * 500) + 50;
    }
    
    // Add assigned info for in-progress tickets
    if (status === 'assigned' || status === 'in-progress') {
      ticket.assignedTo = '2'; // Sam Rodriguez's ID
      
      const scheduled = new Date();
      scheduled.setDate(scheduled.getDate() + Math.floor(Math.random() * 7));
      ticket.scheduledDate = scheduled.toISOString();
    }
    
    mockTickets.push(ticket);
  }
  
  return mockTickets;
};

// Mock staff
const generateMockStaff = (): Staff[] => {
  return [
    {
      id: '2',
      name: 'Sam Rodriguez',
      role: 'Maintenance Staff',
      specialties: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other'],
      available: true,
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    }
  ];
};

// Action types
type TicketAction =
  | { type: 'ADD_TICKET'; payload: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'> }
  | { type: 'UPDATE_TICKET'; payload: Partial<Ticket> & { id: string } }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'ADD_NOTE'; payload: Omit<TicketNote, 'id' | 'createdAt'> }
  | { type: 'ASSIGN_TICKET'; payload: { ticketId: string; staffId: string; scheduledDate?: string } }
  | { type: 'CHANGE_STATUS'; payload: { ticketId: string; status: TicketStatus } }
  | { type: 'ADD_FEEDBACK'; payload: { ticketId: string; rating: number; comment?: string } };

// Ticket reducer
const ticketReducer = (state: Ticket[], action: TicketAction): Ticket[] => {
  switch (action.type) {
    case 'ADD_TICKET':
      return [
        ...state,
        {
          ...action.payload,
          id: uuidv4(),
          status: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    
    case 'UPDATE_TICKET':
      return state.map((ticket) =>
        ticket.id === action.payload.id
          ? { ...ticket, ...action.payload, updatedAt: new Date().toISOString() }
          : ticket
      );
    
    case 'DELETE_TICKET':
      return state.filter((ticket) => ticket.id !== action.payload);
    
    case 'ADD_NOTE':
      return state.map((ticket) =>
        ticket.id === action.payload.ticketId
          ? {
              ...ticket,
              notes: [
                ...(ticket.notes || []),
                {
                  ...action.payload,
                  id: uuidv4(),
                  createdAt: new Date().toISOString(),
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : ticket
      );
    
    case 'ASSIGN_TICKET':
      return state.map((ticket) =>
        ticket.id === action.payload.ticketId
          ? {
              ...ticket,
              assignedTo: action.payload.staffId,
              scheduledDate: action.payload.scheduledDate,
              status: 'assigned',
              updatedAt: new Date().toISOString(),
            }
          : ticket
      );
    
    case 'CHANGE_STATUS':
      return state.map((ticket) =>
        ticket.id === action.payload.ticketId
          ? {
              ...ticket,
              status: action.payload.status,
              ...(action.payload.status === 'resolved' || action.payload.status === 'closed'
                ? { completedDate: new Date().toISOString() }
                : {}),
              updatedAt: new Date().toISOString(),
            }
          : ticket
      );
    
    case 'ADD_FEEDBACK':
      return state.map((ticket) =>
        ticket.id === action.payload.ticketId
          ? {
              ...ticket,
              feedback: {
                rating: action.payload.rating,
                comment: action.payload.comment,
              },
              updatedAt: new Date().toISOString(),
            }
          : ticket
      );
    
    default:
      return state;
  }
};

// Ticket context type
interface TicketContextType {
  tickets: Ticket[];
  staff: Staff[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateTicket: (ticket: Partial<Ticket> & { id: string }) => void;
  deleteTicket: (id: string) => void;
  addNote: (note: Omit<TicketNote, 'id' | 'createdAt'>) => void;
  assignTicket: (ticketId: string, staffId: string, scheduledDate?: string) => void;
  changeStatus: (ticketId: string, status: TicketStatus) => void;
  addFeedback: (ticketId: string, rating: number, comment?: string) => void;
  getTicketsByUser: (userId: string) => Ticket[];
  getTicketsByProperty: (propertyId: string) => Ticket[];
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getTicket: (id: string) => Ticket | undefined;
}

// Create the context
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Ticket provider props
interface TicketProviderProps {
  children: React.ReactNode;
}

// Ticket provider component
export function TicketProvider({ children }: TicketProviderProps) {
  const [tickets, dispatch] = useReducer(ticketReducer, generateMockTickets());
  const [staff] = useState<Staff[]>(generateMockStaff());

  // Add new ticket
  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    dispatch({ type: 'ADD_TICKET', payload: ticket });
  };

  // Update ticket
  const updateTicket = (ticket: Partial<Ticket> & { id: string }) => {
    dispatch({ type: 'UPDATE_TICKET', payload: ticket });
  };

  // Delete ticket
  const deleteTicket = (id: string) => {
    dispatch({ type: 'DELETE_TICKET', payload: id });
  };

  // Add note to ticket
  const addNote = (note: Omit<TicketNote, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NOTE', payload: note });
  };

  // Assign ticket to staff
  const assignTicket = (ticketId: string, staffId: string, scheduledDate?: string) => {
    dispatch({ type: 'ASSIGN_TICKET', payload: { ticketId, staffId, scheduledDate } });
  };

  // Change ticket status
  const changeStatus = (ticketId: string, status: TicketStatus) => {
    dispatch({ type: 'CHANGE_STATUS', payload: { ticketId, status } });
  };

  // Add feedback to ticket
  const addFeedback = (ticketId: string, rating: number, comment?: string) => {
    dispatch({ type: 'ADD_FEEDBACK', payload: { ticketId, rating, comment } });
  };

  // Get tickets by user
  const getTicketsByUser = (userId: string) => {
    return tickets.filter((ticket) => ticket.createdBy === userId);
  };

  // Get tickets by property
  const getTicketsByProperty = (propertyId: string) => {
    return tickets.filter((ticket) => ticket.propertyId === propertyId);
  };

  // Get tickets by status
  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  // Get ticket by id
  const getTicket = (id: string) => {
    return tickets.find((ticket) => ticket.id === id);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        staff,
        addTicket,
        updateTicket,
        deleteTicket,
        addNote,
        assignTicket,
        changeStatus,
        addFeedback,
        getTicketsByUser,
        getTicketsByProperty,
        getTicketsByStatus,
        getTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

// Custom hook to use ticket context
export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}