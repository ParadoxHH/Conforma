'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const useUser = () => {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false, // Don't retry on auth errors
  });

  return {
    user,
    isLoading,
    isError,
  };
};
