import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  institution: string;
  token?: string;
  email_alerts?: boolean;
  weekly_summary?: boolean;
  public_profile?: boolean;
  data_sharing?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>; 
  signup: (name: string, email: string, password: string, institution: string) => Promise<void>; 
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => void; 
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  });

  const API_URL = 'http://localhost:8000/api'; 

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(userData => setUser(userData))
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Invalid credentials');

    const data = await response.json();
    
    if (rememberMe) {
      localStorage.setItem('token', data.token); 
    } else {
      sessionStorage.setItem('token', data.token); 
    }
    
    setToken(data.token);
    setUser(data.user); 
  };

  const signup = async (name: string, email: string, password: string, institution: string) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, password, institution }),
    });

    if (!response.ok) throw new Error('Signup failed');

    const data = await response.json();
    localStorage.setItem('token', data.token); 
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      } catch (error) {
        console.warn('Server logout failed.', error);
      }
    }
    
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, signup, logout, isLoading, updateUser, 
      isLoginModalOpen, setLoginModalOpen 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};