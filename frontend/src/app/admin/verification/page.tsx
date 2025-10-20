'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

type AdminDocument = {
  id: string;
  type: 'LICENSE' | 'INSURANCE' | 'CERT' | 'OTHER';
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW' | 'EXPIRED';
  aiStatus: 'NONE' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
  aiConfidence: number;
  aiReason?: string | null;
  issuer?: string | null;
  policyNumber?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    contractor?: { companyName: string | null } | null;
  };
};

type ReviewFormState = {
  status: AdminDocument['status'];
  reason: string;
  effectiveTo: string;
};

const statusOptions: Array<{ value: AdminDocument['status']; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'NEEDS_REVIEW', label: 'Needs review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

type StatusFilter = AdminDocument['status'] | '';

const filterOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'All statuses' },
  ...statusOptions.map((option) => ({ value: option.value as StatusFilter, label: option.label })),
];

const statusBadgeClass = (status: AdminDocument['status']) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'NEEDS_REVIEW':
      return 'bg-amber-100 text-amber-700';
    case 'EXPIRED':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const aiStatusBadgeClass = (status: AdminDocument['aiStatus']) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700';
    case 'REJECTED':
      return 'bg-red-50 text-red-700';
    case 'NEEDS_REVIEW':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-slate-50 text-slate-600';
  }
};

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
};

const confidenceLabel = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const clamped = Math.max(0, Math.min(1, value));
  return `${Math.round(clamped * 100)}%`;
};

const fetchDocuments = (status: string) => {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<{ documents: AdminDocument[] }>(`/admin/documents${query}`);
};

export default function AdminVerificationPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [selectedDocument, setSelectedDocument] = useState<AdminDocument | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>({
    status: 'PENDING',
    reason: '',
    effectiveTo: '',
  });

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ['admin-documents', statusFilter],
    queryFn: () => fetchDocuments(statusFilter),
  });

  const documents = data?.documents ?? [];

  const reviewMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      status: AdminDocument['status'];
      reason?: string;
      effectiveTo?: string;
    }) =>
      apiClient.post(`/admin/documents/${payload.id}/review`, {
        status: payload.status,
        reason: payload.reason,
        effectiveTo: payload.effectiveTo,
      }),
    onSuccess: () => {
      refetch();
      setSelectedDocument(null);
    },
  });

  const reverifyMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/documents/${id}/reverify`),
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (selectedDocument) {
      setReviewForm({
        status: selectedDocument.status,
        reason: selectedDocument.notes ?? '',
        effectiveTo: selectedDocument.effectiveTo
          ? selectedDocument.effectiveTo.slice(0, 10)
          : '',
      });
    }
  }, [selectedDocument]);

  const openDocument = (doc: AdminDocument) => {
    setSelectedDocument(doc);
  };

  const closeDrawer = () => {
    setSelectedDocument(null);
  };

  const handleSaveDecision = () => {
    if (!selectedDocument) {
      return;
    }

    reviewMutation.mutate({
      id: selectedDocument.id,
      status: reviewForm.status,
      reason: reviewForm.reason.trim() || undefined,
      effectiveTo: reviewForm.effectiveTo || undefined,
    });
  };

  const handleReverify = () => {
    if (!selectedDocument) {
      return;
    }
    reverifyMutation.mutate(selectedDocument.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Verification review queue</h1>
        <p className="mt-2 text-sm text-slate-600">
          Inspect uploaded insurance and license documents, override AI decisions, and request
          reverification.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error)?.message ?? 'Failed to load verification documents.'}
        </div>
      ) : null}

      <div className="space-y-3">
        {isFetching && documents.length === 0 ? (
          <p className="text-sm text-slate-600">Loading documents...</p>
        ) : null}
        {!isFetching && documents.length === 0 ? (
          <p className="text-sm text-slate-600">No documents match this status.</p>
        ) : null}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{doc.type}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                      statusBadgeClass(doc.status),
                    )}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Uploaded {formatDateLabel(doc.createdAt)} · Owner {doc.user.email}
                  {doc.user.contractor?.companyName
                    ? ` · ${doc.user.contractor.companyName}`
                    : ''}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    aiStatusBadgeClass(doc.aiStatus),
                  )}
                >
                  AI {doc.aiStatus.toLowerCase()} · Confidence {confidenceLabel(doc.aiConfidence)}
                </span>
                <Button variant="outline" onClick={() => openDocument(doc)}>
                  Review
                </Button>
              </div>
            </div>
            <a href={doc.url} className="text-xs text-primary" target="_blank" rel="noreferrer">
              {doc.url}
            </a>
            {doc.aiReason ? (
              <p className="text-xs text-slate-600">AI notes: {doc.aiReason}</p>
            ) : null}
            <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              {doc.issuer ? (
                <div className="rounded-md bg-slate-100 px-2 py-1">Issuer: {doc.issuer}</div>
              ) : null}
              {doc.policyNumber ? (
                <div className="rounded-md bg-slate-100 px-2 py-1">
                  Policy #: {doc.policyNumber}
                </div>
              ) : null}
              {doc.effectiveFrom ? (
                <div className="rounded-md bg-slate-100 px-2 py-1">
                  Active since {formatDateLabel(doc.effectiveFrom)}
                </div>
              ) : null}
              {doc.effectiveTo ? (
                <div className="rounded-md bg-slate-100 px-2 py-1">
                  Valid until {formatDateLabel(doc.effectiveTo)}
                </div>
              ) : null}
            </div>
            {doc.notes ? (
              <p className="text-xs text-slate-500">Reviewer notes: {doc.notes}</p>
            ) : null}
          </div>
        ))}
      </div>

      <Drawer open={Boolean(selectedDocument)} onOpenChange={(open) => (!open ? closeDrawer() : null)}>
        <DrawerContent className="flex justify-center">
          <div className="w-full max-w-2xl space-y-5 px-4 py-6 md:px-8">
            {selectedDocument ? (
              <>
                <DrawerHeader className="space-y-1">
                  <DrawerTitle>{selectedDocument.type} verification</DrawerTitle>
                  <DrawerDescription>
                    AI status {selectedDocument.aiStatus.toLowerCase()} with confidence{' '}
                    {confidenceLabel(selectedDocument.aiConfidence)}.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">Owner</p>
                    <p>{selectedDocument.user.email}</p>
                    {selectedDocument.user.contractor?.companyName ? (
                      <p className="text-xs text-slate-500">
                        {selectedDocument.user.contractor.companyName}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-lg bg-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-500">Current status</p>
                    <p className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                          statusBadgeClass(selectedDocument.status),
                        )}
                      >
                        {selectedDocument.status}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          aiStatusBadgeClass(selectedDocument.aiStatus),
                        )}
                      >
                        AI {selectedDocument.aiStatus.toLowerCase()}
                      </span>
                    </p>
                  </div>
                  {selectedDocument.issuer ? (
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Issuer</p>
                      <p>{selectedDocument.issuer}</p>
                    </div>
                  ) : null}
                  {selectedDocument.policyNumber ? (
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Policy / License #</p>
                      <p>{selectedDocument.policyNumber}</p>
                    </div>
                  ) : null}
                  {selectedDocument.effectiveFrom ? (
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Effective from</p>
                      <p>{formatDateLabel(selectedDocument.effectiveFrom)}</p>
                    </div>
                  ) : null}
                  {selectedDocument.effectiveTo ? (
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold text-slate-500">Effective to</p>
                      <p>{formatDateLabel(selectedDocument.effectiveTo)}</p>
                    </div>
                  ) : null}
                </div>

                {selectedDocument.aiReason ? (
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">AI notes: </span>
                    {selectedDocument.aiReason}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="review-status">Override status</Label>
                    <Select
                      value={reviewForm.status}
                      onValueChange={(value) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          status: value as AdminDocument['status'],
                        }))
                      }
                    >
                      <SelectTrigger id="review-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-effective-to">Expiration date</Label>
                    <Input
                      id="review-effective-to"
                      type="date"
                      value={reviewForm.effectiveTo}
                      onChange={(event) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          effectiveTo: event.target.value,
                        }))
                      }
                    />
                    <p className="text-[11px] text-slate-500">
                      Provide an expiration when approving insurance certificates.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-notes">Reviewer notes</Label>
                  <Textarea
                    id="review-notes"
                    rows={4}
                    value={reviewForm.reason}
                    onChange={(event) =>
                      setReviewForm((prev) => ({ ...prev, reason: event.target.value }))
                    }
                    placeholder="Share any context for this decision."
                  />
                </div>

                {reviewMutation.isError ? (
                  <p className="text-xs text-destructive">
                    {(reviewMutation.error as Error)?.message ?? 'Unable to update document.'}
                  </p>
                ) : null}

                {reverifyMutation.isError ? (
                  <p className="text-xs text-destructive">
                    {(reverifyMutation.error as Error)?.message ?? 'Failed to queue reverification.'}
                  </p>
                ) : null}

                <DrawerFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReverify}
                    disabled={reverifyMutation.isPending}
                  >
                    {reverifyMutation.isPending ? 'Rechecking...' : 'Re-run AI verification'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <DrawerClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DrawerClose>
                    <Button
                      type="button"
                      onClick={handleSaveDecision}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? 'Saving...' : 'Save decision'}
                    </Button>
                  </div>
                </DrawerFooter>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
