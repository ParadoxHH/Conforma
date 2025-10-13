'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchJobs = async () => {
  const { data } = await api.get('/jobs');
  return data;
};

export const useJobs = () => {
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  return {
    jobs,
    isLoading,
    isError,
    error,
  };
};
