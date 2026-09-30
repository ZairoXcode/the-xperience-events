'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('xperience_token');
    const savedUser = localStorage.getItem('xperience_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('xperience_token');
        localStorage.removeItem('xperience_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('xperience_token', data.token);
    localStorage.setItem('xperience_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    router.push('/events');
  };

  const register = async (email: string, name: string, password: string) => {
    const data = await api.register({ email, name, password });
    localStorage.setItem('xperience_token', data.token);
    localStorage.setItem('xperience_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    router.push('/events');
  };

  const logout = () => {
    localStorage.removeItem('xperience_token');
    localStorage.removeItem('xperience_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
