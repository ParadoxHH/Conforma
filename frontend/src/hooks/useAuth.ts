'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => api.post('/auth/login', credentials),
    onSuccess: (data) => {
      toast.success('Login successful!');
      localStorage.setItem('authToken', data.data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: (userInfo: any) => api.post('/auth/register', userInfo),
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      router.push('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    router.push('/auth/login');
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
};
