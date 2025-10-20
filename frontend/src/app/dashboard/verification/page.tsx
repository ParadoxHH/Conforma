'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeRow } from '@/components/badge-row';

type DocumentRecord = {
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
};

type UploadUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
};

type ProfileSummary = {
  contractor?: {
    verifiedKyc: boolean;
    verifiedLicense: boolean;
    verifiedInsurance: boolean;
  } | null;
};

const statusBadgeClass = (status: DocumentRecord['status']) => {
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

const aiStatusBadgeClass = (status: DocumentRecord['aiStatus']) => {
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

const expiresSoon = (value?: string | null, days = 30) => {
  if (!value) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const now = Date.now();
  const diff = parsed.getTime() - now;
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
};

const fetchDocuments = () => apiClient.get<{ documents: DocumentRecord[] }>('/documents');
const fetchProfileSummary = () =>
  apiClient.get<ProfileSummary>('/profiles/me').then((profile) => ({
    kyc: profile.contractor?.verifiedKyc ?? false,
    license: profile.contractor?.verifiedLicense ?? false,
    insurance: profile.contractor?.verifiedInsurance ?? false,
  }));

export default function VerificationPage() {
  const [selectedType, setSelectedType] = useState<'LICENSE' | 'INSURANCE' | 'CERT' | 'OTHER'>('LICENSE');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadHint, setUploadHint] = useState<UploadUrlResponse | null>(null);

  const {
    data: docsData,
    refetch,
    isLoading: docsLoading,
    isError: docsError,
    error: docsErrorDetails,
  } = useQuery({ queryKey: ['documents'], queryFn: fetchDocuments });

  const {
    data: badges,
    isLoading: badgesLoading,
    isError: badgesError,
    error: badgesErrorDetails,
  } = useQuery({ queryKey: ['profile-verification'], queryFn: fetchProfileSummary });

  const uploadLinkMutation = useMutation({
    mutationFn: () => apiClient.post<UploadUrlResponse>('/documents/upload-url', { type: selectedType }),
    onSuccess: (payload) => {
      setUploadHint(payload);
      setFileUrl(payload.fileUrl);
    },
  });

  const submitDocumentMutation = useMutation({
    mutationFn: () => apiClient.post('/documents', { type: selectedType, fileUrl }),
    onSuccess: () => {
      setFileUrl('');
      setUploadHint(null);
      refetch();
    },
  });

  if (docsLoading || badgesLoading) {
    return <p>Loading verification details...</p>;
  }

  if (docsError || badgesError) {
    const message =
      docsErrorDetails instanceof Error
        ? docsErrorDetails.message
        : badgesErrorDetails instanceof Error
        ? badgesErrorDetails.message
        : 'Unable to load verification details. Please sign in again to continue.';

    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {message}
      </div>
    );
  }

  const badgesState = badges ?? { kyc: false, license: false, insurance: false };
  const documents = docsData?.documents ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Verification center</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload your license and insurance documents so the Conforma team can approve your profile badges.
        </p>
      </div>

      <BadgeRow badges={badgesState} />

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Upload new document</h2>
        <p className="mt-1 text-xs text-slate-500">
          Request an upload URL, then send the generated URL a PUT request with your file. Paste the resulting file URL below.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="doc-type">Document type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
              <SelectTrigger id="doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LICENSE">License</SelectItem>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="CERT">Certificate</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={() => uploadLinkMutation.mutate()} disabled={uploadLinkMutation.isPending}>
            {uploadLinkMutation.isPending ? 'Requesting...' : 'Generate upload URL'}
          </Button>
        </div>
        {uploadHint ? (
          <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-slate-600">
            <p className="font-semibold text-primary">Upload instructions</p>
            <p className="mt-2 break-all">PUT file to: {uploadHint.uploadUrl}</p>
            <p className="mt-1 break-all">File will be available at: {uploadHint.fileUrl}</p>
          </div>
        ) : null}
        <div className="mt-4">
          <Label htmlFor="fileUrl">File URL</Label>
          <Input
            id="fileUrl"
            
            placeholder="https://cdn.conforma.com/your-license.pdf"
            autoComplete="url"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
          />
        </div>
        <Button
          className="mt-4"
          type="button"
          disabled={submitDocumentMutation.isPending || !fileUrl}
          onClick={() => submitDocumentMutation.mutate()}
        >
          {submitDocumentMutation.isPending ? 'Submitting...' : 'Submit for review'}
        </Button>
        {submitDocumentMutation.isSuccess ? (
          <p className="mt-2 text-xs text-success">Document submitted. We will notify you once reviewed.</p>
        ) : null}
        {submitDocumentMutation.isError ? (
          <p className="mt-2 text-xs text-destructive">
            {(submitDocumentMutation.error as Error).message ?? 'Unable to submit document.'}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Uploaded documents</h2>
        <div className="mt-4 space-y-3 text-sm">
          {documents.length === 0 ? (
            <p className="text-slate-600">No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => {
              const confidenceLabel = Number.isFinite(doc.aiConfidence)
                ? `${Math.round(doc.aiConfidence * 100)}%`
                : '—';
              const approachingExpiry = expiresSoon(doc.effectiveTo);

              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{doc.type}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(doc.status)}`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Uploaded {formatDateLabel(doc.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-start gap-1 text-xs md:items-end">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${aiStatusBadgeClass(doc.aiStatus)}`}
                      >
                        AI {doc.aiStatus.toLowerCase()}
                      </span>
                      <span className="text-xs text-slate-500">Confidence {confidenceLabel}</span>
                    </div>
                  </div>
                  <a href={doc.url} className="text-xs text-primary" target="_blank" rel="noreferrer">
                    {doc.url}
                  </a>
                  {doc.aiReason ? (
                    <p className="text-xs text-slate-600">AI notes: {doc.aiReason}</p>
                  ) : null}
                  <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    {doc.policyNumber ? (
                      <div className="rounded-md bg-slate-100 px-2 py-1">Policy #: {doc.policyNumber}</div>
                    ) : null}
                    {doc.issuer ? (
                      <div className="rounded-md bg-slate-100 px-2 py-1">Issuer: {doc.issuer}</div>
                    ) : null}
                    {doc.effectiveFrom ? (
                      <div className="rounded-md bg-slate-100 px-2 py-1">
                        Effective {formatDateLabel(doc.effectiveFrom)}
                      </div>
                    ) : null}
                    {doc.effectiveTo ? (
                      <div
                        className={`rounded-md px-2 py-1 ${
                          doc.status === 'EXPIRED'
                            ? 'bg-rose-100 text-rose-700'
                            : approachingExpiry
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Expires {formatDateLabel(doc.effectiveTo)}
                      </div>
                    ) : null}
                  </div>
                  {doc.notes ? (
                    <p className="text-xs text-slate-500">Reviewer notes: {doc.notes}</p>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

