import { useState } from 'react';
import { loginUser, logoutUser } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginUser(email, password);
      toast({
        title: "Login successful",
        description: "Welcome to GradGuide CRM",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };
};
