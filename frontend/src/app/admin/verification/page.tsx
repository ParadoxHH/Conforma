'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type AdminDocument = {
  id: string;
  type: 'LICENSE' | 'INSURANCE' | 'OTHER';
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    contractor?: { companyName: string | null } | null;
  };
};

const fetchDocuments = (status: string) => {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<{ documents: AdminDocument[] }>(`/admin/documents${query}`);
};

export default function AdminVerificationPage() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING');
  const [rejectReason, setRejectReason] = useState('');

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['admin-documents', statusFilter],
    queryFn: () => fetchDocuments(statusFilter),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/documents/${id}/approve`),
    onSuccess: () => refetch(),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/documents/${id}/reject`, {
        notes: rejectReason || 'Rejected by admin',
      }),
    onSuccess: () => {
      setRejectReason('');
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Verification review queue</h1>
        <p className="mt-2 text-sm text-slate-600">Approve or reject contractor verification documents.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {data?.documents.length ? (
          data.documents.map((doc) => (
            <div key={doc.id} className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{doc.type}</p>
                  <p className="text-xs text-slate-500">
                    {doc.user.email} • {doc.user.contractor?.companyName ?? 'Contractor'}
                  </p>
                </div>
                <span
                  className={(() => {
                    if (doc.status === 'APPROVED') return 'text-success';
                    if (doc.status === 'REJECTED') return 'text-destructive';
                    return 'text-amber-600';
                  })()}
                >
                  {doc.status}
                </span>
              </div>
              <a href={doc.url} className="mt-3 block text-sm text-primary" target="_blank" rel="noreferrer">
                View document ↗
              </a>
              {doc.notes ? <p className="mt-2 text-xs text-slate-500">Notes: {doc.notes}</p> : null}

              {doc.status === 'PENDING' ? (
                <div className="mt-4 flex flex-col gap-3">
                  <Textarea
                    placeholder="Add rejection notes"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => approveMutation.mutate(doc.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(doc.id)}
                      disabled={rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No documents match this status.</p>
        )}
      </div>
    </div>
  );
}
