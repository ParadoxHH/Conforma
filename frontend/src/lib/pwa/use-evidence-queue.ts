'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  EvidenceQueueRecord,
  addEvidenceRecord,
  deleteEvidenceRecord,
  listEvidenceRecords,
  updateEvidenceRecord,
} from './evidence-store';

export const useEvidenceQueue = () => {
  const [records, setRecords] = useState<EvidenceQueueRecord[]>([]);

  const refresh = useCallback(async () => {
    const items = await listEvidenceRecords();
    setRecords(items);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (payload: Parameters<typeof addEvidenceRecord>[0]) => {
      const record = await addEvidenceRecord(payload);
      await refresh();
      return record;
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, updates: Partial<EvidenceQueueRecord>) => {
      await updateEvidenceRecord(id, updates);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteEvidenceRecord(id);
      await refresh();
    },
    [refresh],
  );

  return {
    records,
    add,
    update,
    remove,
    refresh,
  };
};
