/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import endpoints from '@/services/endpoints';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/axiosInstance';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadAuthState = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user'); // Retrieve the user object as a string

      if (storedToken && storedUser) {
        const parsedUser: UserData = JSON.parse(storedUser); // Parse the JSON string back to an object
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error("Failed to load auth state from localStorage", e);
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setError("Failed to load session. Please log in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loginData = new URLSearchParams();
      loginData.append('username', email);
      loginData.append('password', password);

      const response = await axiosInstance.post<LoginResponse>(endpoints.login, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, token_type, user: loggedInUser } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_type', token_type);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setIsAuthenticated(true);

      toast({
        title: "Login successful!",
        description: `Welcome, ${loggedInUser.name}.`,
        variant: "default",
      });

      router.push('/');

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Invalid credentials";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = "counselor") => {
    setLoading(true);
    setError(null);
    try {
      const signupData = {
        "name":name,
        "email":email,
        "password":password,
        "role":role
      }
      const response = await axiosInstance.post<UserData>(endpoints.signup, signupData);
      if (response.status === 201) {
        router.push('/login');
      }
      else {
        throw new Error("Signup completed with unexpected status.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Signup failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "default",
      });

      router.push('/login');

    } catch (error: any) {
      const errorMessage = error.message || "Logout failed.";
      setError(errorMessage);
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, router]);
  return {
    user,
    login,
    logout,
    signup,
    loading,
    isAuthenticated, // Boolean flag for authentication status
    error,
  };
};
