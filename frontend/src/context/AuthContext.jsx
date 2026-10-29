import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axiosClient
        .get('/auth/me')
        .then(({ data }) => setUser(data.data.user))
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    const { accessToken, user: userData } = data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await axiosClient.post('/auth/register', formData);
    const { accessToken, user: userData } = data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/auth/me');
      setUser(data.data.user);
    } catch (_) {
      // ignore
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

