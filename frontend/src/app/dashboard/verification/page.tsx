'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeRow } from '@/components/badge-row';

type DocumentRecord = {
  id: string;
  type: 'LICENSE' | 'INSURANCE' | 'OTHER';
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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

const fetchDocuments = () => apiClient.get<{ documents: DocumentRecord[] }>('/documents');
const fetchProfileSummary = () =>
  apiClient.get<ProfileSummary>('/profiles/me').then((profile) => ({
    kyc: profile.contractor?.verifiedKyc ?? false,
    license: profile.contractor?.verifiedLicense ?? false,
    insurance: profile.contractor?.verifiedInsurance ?? false,
  }));

export default function VerificationPage() {
  const [selectedType, setSelectedType] = useState<'LICENSE' | 'INSURANCE' | 'OTHER'>('LICENSE');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadHint, setUploadHint] = useState<UploadUrlResponse | null>(null);

  const { data: docsData, refetch } = useQuery({ queryKey: ['documents'], queryFn: fetchDocuments });
  const { data: badges } = useQuery({ queryKey: ['profile-verification'], queryFn: fetchProfileSummary });

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
          Request an upload URL, then send the generated `uploadUrl` a PUT request with your file. Paste the resulting file URL below.
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
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={() => uploadLinkMutation.mutate()} disabled={uploadLinkMutation.isPending}>
            {uploadLinkMutation.isPending ? 'Requesting…' : 'Generate upload URL'}
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
          {submitDocumentMutation.isPending ? 'Submitting…' : 'Submit for review'}
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
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{doc.type}</span>
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
                <a href={doc.url} className="text-xs text-primary" target="_blank" rel="noreferrer">
                  {doc.url}
                </a>
                {doc.notes ? <p className="text-xs text-slate-500">Notes: {doc.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
