'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

 type DashboardJob = {
  id: string;
  title: string;
  status: string;
 };

const fetchJobs = () => apiClient.get<DashboardJob[]>('/jobs');

export default function MessagesIndexPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Project conversations</h1>
      <p className="mt-2 text-sm text-slate-600">
        Select a job to open the chat thread shared with your project team.
      </p>
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-600">Loading jobs…</p>
        ) : data && data.length > 0 ? (
          data.map((job) => (
            <Link
              key={job.id}
              href={/dashboard/messages/}
              className="block rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
            >
              <p className="text-sm font-semibold text-slate-900">{job.title}</p>
              <p className="text-xs text-slate-500">{job.status}</p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-600">No active jobs yet. Create a job or accept an invitation to begin messaging.</p>
        )}
      </div>
    </div>
  );
}
