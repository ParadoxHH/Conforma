'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { apiClient } from '@/lib/api-client';
import { ChatMessage } from '@/types/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type JobDetails = {
  id: string;
  title: string;
  status: string;
};

const messageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

type MessageFormValues = z.infer<typeof messageSchema>;

const fetchJob = (jobId: string) => apiClient.get<JobDetails>(`/jobs/${jobId}`);
const fetchMessages = (jobId: string) => apiClient.get<ChatMessage[]>(`/jobs/${jobId}/messages`);

export default function JobMessagesPage({ params }: { params: { jobId: string } }) {
  const jobId = params.jobId;

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
  });

  const {
    data: messages,
    isLoading: messagesLoading,
    refetch,
  } = useQuery({
    queryKey: ['job-messages', jobId],
    queryFn: () => fetchMessages(jobId),
    refetchInterval: 5000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => apiClient.post(`/jobs/${jobId}/messages/read`),
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      markReadMutation.mutate();
    }
  }, [jobId, messages, markReadMutation]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: '' },
  });

  const sendMessage = useMutation({
    mutationFn: (data: MessageFormValues) => apiClient.post(`/jobs/${jobId}/messages`, data),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((values) => {
        sendMessage.mutate(values);
      }),
    [handleSubmit, sendMessage],
  );

  if (jobLoading) {
    return <div>Loading job…</div>;
  }

  if (!job) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Job not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This job may have been archived. Return to the jobs dashboard to select another conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Job conversation</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{job.title}</h1>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{job.status}</p>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messagesLoading ? (
            <p className="text-sm text-slate-600">Loading messages…</p>
          ) : messages && messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-1 rounded-2xl bg-primary/5 p-3 text-sm text-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{message.sender.email}</span>
                  <span className="text-slate-400">
                    {new Date(message.createdAt).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p>{message.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No messages yet. Start the conversation below.</p>
          )}
        </div>
        <form onSubmit={onSubmit} className="border-t border-slate-200/70 bg-white p-4">
          <Textarea
            rows={3}
            placeholder="Type a message to the project team…"
            {...register('body')}
            disabled={isSubmitting || sendMessage.isPending}
          />
          {errors.body ? <p className="mt-2 text-xs text-destructive">{errors.body.message}</p> : null}
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={isSubmitting || sendMessage.isPending}>
              {sendMessage.isPending ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
