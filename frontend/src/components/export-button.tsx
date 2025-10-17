'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { getAuthToken } from '@/lib/api-client';

type ExportButtonProps = {
  from?: Date;
  to?: Date;
  filename?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export function ExportButton({ from, to, filename = 'accounting-export.csv' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
      const url = new URL('exports/accounting.csv', base);
      if (from) {
        url.searchParams.set('from', from.toISOString());
      }
      if (to) {
        url.searchParams.set('to', to.toISOString());
      }

      const token = getAuthToken();
      const response = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to download export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleExport} disabled={loading} variant="outline">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Download CSV
      </Button>
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </div>
  );
}
