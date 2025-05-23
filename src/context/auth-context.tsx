import { createContext, useContext, useState, useEffect } from 'react';

// User roles
export type UserRole = 'tenant' | 'staff' | 'manager';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  propertyId?: string;
  unitNumber?: string;
}

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ernest Rrika',
    email: 'tenant@example.com',
    role: 'tenant',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg',
    propertyId: 'prop-001',
    unitNumber: '101',
  },
  {
    id: '2',
    name: 'Sam Rodriguez',
    email: 'staff@example.com',
    role: 'staff',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
  },
  {
    id: '3',
    name: 'Morgan Smith',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
  },
];

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ppm-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find user by email (password is ignored for demo)
    const foundUser = MOCK_USERS.find((u) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('ppm-user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ppm-user');
  };

  // Switch role function (for demo purposes)
  const switchRole = (role: UserRole) => {
    const newUser = MOCK_USERS.find((u) => u.role === role);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('ppm-user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}