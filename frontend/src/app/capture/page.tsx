'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvidenceQueue } from '@/lib/pwa/use-evidence-queue';
import { EvidenceQueueRecord } from '@/lib/pwa/evidence-store';

type JobSummary = {
  id: string;
  title: string;
  status: string;
  milestones: Array<{
    id: string;
    title: string;
    status: string;
  }>;
};

type RemoteEvidence = {
  id: string;
  url: string;
  type: string;
  createdAt: string;
};

type EvidenceUploadUrl = {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
};

type RecordEvidenceResponse = {
  evidence: RemoteEvidence;
  duplicate: boolean;
};

const fetchJobs = () => apiClient.get<JobSummary[]>('/jobs');

const computeSHA256 = async (file: Blob) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const formatDateLabel = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
};

export default function CapturePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  const { records, add, update, remove, refresh } = useEvidenceQueue();

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const jobs = jobsQuery.data ?? [];

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId),
    [jobs, selectedJobId],
  );

  const selectedMilestone = useMemo(
    () => selectedJob?.milestones.find((milestone) => milestone.id === selectedMilestoneId) ?? null,
    [selectedJob, selectedMilestoneId],
  );

  const remoteEvidenceQuery = useQuery({
    queryKey: ['evidence', selectedMilestoneId],
    queryFn: () =>
      apiClient
        .get<{ evidence: RemoteEvidence[] }>(`/evidence/milestones/${selectedMilestoneId}`)
        .then((response) => response.evidence),
    enabled: Boolean(selectedMilestoneId),
  });

  const registerBackgroundSync = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!('serviceWorker' in navigator)) {
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      try {
        await registration.sync.register('conforma-evidence-sync');
      } catch (error) {
        console.warn('Background sync registration failed', error);
      }
    }
  }, []);

  const recordEvidenceMutation = useMutation({
    mutationFn: (payload: { milestoneId: string; fileUrl: string; type: string; contentHash: string }) =>
      apiClient.post<RecordEvidenceResponse>('/evidence', payload),
    onSuccess: () => {
      remoteEvidenceQuery.refetch();
    },
  });

  const syncRecord = useCallback(
    async (record: EvidenceQueueRecord) => {
      await update(record.id, { status: 'uploading', lastError: undefined });

      try {
        const upload = await apiClient.post<EvidenceUploadUrl>('/evidence/upload-url', {
          milestoneId: record.milestoneId,
          mimeType: record.mimeType,
        });

        // Attempt to upload to object storage if supported.
        try {
          await fetch(upload.uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': record.mimeType || 'application/octet-stream',
            },
            body: record.file,
          });
        } catch (error) {
          console.warn('Unable to upload to presigned URL, continuing anyway', error);
        }

        const response = await recordEvidenceMutation.mutateAsync({
          milestoneId: record.milestoneId,
          fileUrl: upload.fileUrl,
          type: record.mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
          contentHash: record.contentHash,
        });

        await remove(record.id);

        if (!response.duplicate) {
          remoteEvidenceQuery.refetch();
        }
      } catch (error) {
        await update(record.id, {
          status: 'error',
          lastError: (error as Error)?.message ?? 'Upload failed',
        });
      } finally {
        refresh();
      }
    },
    [recordEvidenceMutation, refresh, remove, remoteEvidenceQuery, update],
  );

  const syncAll = useCallback(async () => {
    const pending = records.filter((record) => record.status !== 'uploading');
    for (const record of pending) {
      await syncRecord(record);
    }
    if (pending.length === 0) {
      await refresh();
    }
  }, [records, refresh, syncRecord]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }
      if (!selectedJobId || !selectedMilestoneId) {
        alert('Select a job and milestone before capturing evidence.');
        return;
      }

      for (const file of Array.from(files)) {
        const hash = await computeSHA256(file);
        await add({
          jobId: selectedJobId,
          milestoneId: selectedMilestoneId,
          file,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          contentHash: hash,
        });
      }

      event.target.value = '';
      await registerBackgroundSync();
      if (isOnline) {
        await syncAll();
      }
    },
    [add, isOnline, registerBackgroundSync, selectedJobId, selectedMilestoneId, syncAll],
  );

  const handleRemoveRecord = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove],
  );

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }
    const milestoneIds = selectedJob.milestones.map((milestone) => milestone.id);
    if (!milestoneIds.includes(selectedMilestoneId)) {
      const firstMilestone = selectedJob.milestones[0];
      setSelectedMilestoneId(firstMilestone ? firstMilestone.id : '');
    }
  }, [selectedJob, selectedMilestoneId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleOnline = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncAll();
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOnline);
    };
  }, [syncAll]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return undefined;
    }
    const handler = (event: MessageEvent) => {
      if (event.data === 'SYNC_EVIDENCE_QUEUE') {
        syncAll();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, [syncAll]);

  const remoteEvidence = remoteEvidenceQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Capture site evidence</h1>
        <p className="mt-2 text-sm text-slate-600">
          Take photos or videos even when you&apos;re offline. Conforma will sync them once you have
          a connection.
        </p>
      </div>

      {!isOnline ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          You&apos;re offline. Evidence will be queued and uploaded automatically once you reconnect.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select job</p>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Select milestone
          </p>
          <Select value={selectedMilestoneId} onValueChange={setSelectedMilestoneId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a milestone" />
            </SelectTrigger>
            <SelectContent>
              {selectedJob?.milestones.map((milestone) => (
                <SelectItem key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </SelectItem>
              )) ?? <SelectItem value="">No milestones</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">New capture</h2>
            <p className="text-sm text-slate-600">
              Photos and videos are stored locally until Conforma confirms receipt.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => syncAll()} disabled={records.length === 0}>
              Sync pending ({records.length})
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={!selectedMilestoneId}>
              Capture photo / video
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Pending uploads</h2>
        <div className="mt-4 space-y-2 text-sm">
          {records.length === 0 ? (
            <p className="text-slate-600">All evidence has been uploaded.</p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{record.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {record.mimeType} · Added {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        record.status === 'uploading'
                          ? 'bg-slate-200 text-slate-600'
                          : record.status === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {record.status === 'pending'
                        ? 'Pending'
                        : record.status === 'uploading'
                        ? 'Uploading'
                        : record.status === 'error'
                        ? 'Error'
                        : 'Synced'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncRecord(record)}
                      disabled={record.status === 'uploading'}
                    >
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRecord(record.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                {record.lastError ? (
                  <p className="text-xs text-red-600">Error: {record.lastError}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Synced evidence</h2>
        <div className="mt-4 space-y-2 text-sm">
          {remoteEvidenceQuery.isLoading ? (
            <p className="text-slate-600">Loading synced evidence…</p>
          ) : remoteEvidence.length === 0 ? (
            <p className="text-slate-600">Nothing uploaded yet for this milestone.</p>
          ) : (
            remoteEvidence.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.type}</span>
                  <span className="text-xs text-slate-500">
                    Uploaded {formatDateLabel(item.createdAt)}
                  </span>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-primary">
                  {item.url}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
