// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the user object
interface User {
  id: string;
  email: string;
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updatePassword: (newPass: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // In a real app, you'd verify credentials against a backend.
        // Here, we'll just accept any "admin@coworkcentral.com" login.
        if (email === 'admin@coworkcentral.com' && pass) {
          const userData: User = { id: '1', email };
          localStorage.setItem('authUser', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call for signup
     return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // In this simplified version, signup is essentially the same as login.
        // A real app would check if the user exists and create a new one.
        if (email && pass) {
          const userData: User = { id: '1', email };
           localStorage.setItem('authUser', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password for signup.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
  };
  
  const updatePassword = async (newPass: string) => {
    // Simulate API call to update password
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if(user && newPass) {
                // In a real app, send this to the backend
                console.log(`Password for ${user.email} updated.`);
                resolve();
            } else {
                reject(new Error("No user logged in or no new password provided."));
            }
        }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
