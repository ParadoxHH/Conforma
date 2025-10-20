import { openDB } from 'idb';

const DB_NAME = 'conforma-evidence';
const STORE_NAME = 'pendingEvidence';

export type EvidenceQueueStatus = 'pending' | 'uploading' | 'synced' | 'error';

export type EvidenceQueueRecord = {
  id: string;
  jobId: string;
  milestoneId: string;
  fileName: string;
  mimeType: string;
  contentHash: string;
  createdAt: number;
  status: EvidenceQueueStatus;
  file: Blob;
  lastError?: string;
  remoteUrl?: string;
  uploadedAt?: number;
};

const getDb = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status');
      }
    },
  });

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const addEvidenceRecord = async (record: {
  jobId: string;
  milestoneId: string;
  file: Blob;
  fileName: string;
  mimeType: string;
  contentHash: string;
}): Promise<EvidenceQueueRecord> => {
  const db = await getDb();
  const newRecord: EvidenceQueueRecord = {
    id: generateId(),
    jobId: record.jobId,
    milestoneId: record.milestoneId,
    fileName: record.fileName,
    mimeType: record.mimeType,
    contentHash: record.contentHash,
    file: record.file,
    createdAt: Date.now(),
    status: 'pending',
  };
  await db.put(STORE_NAME, newRecord);
  return newRecord;
};

export const updateEvidenceRecord = async (
  id: string,
  updates: Partial<EvidenceQueueRecord>,
) => {
  const db = await getDb();
  const existing = await db.get(STORE_NAME, id);
  if (!existing) {
    return;
  }
  await db.put(STORE_NAME, {
    ...existing,
    ...updates,
  });
};

export const deleteEvidenceRecord = async (id: string) => {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
};

export const listEvidenceRecords = async (): Promise<EvidenceQueueRecord[]> => {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => a.createdAt - b.createdAt);
};

export const clearSyncedRecords = async () => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  await Promise.all(
    all
      .filter((record) => record.status === 'synced')
      .map((record) => store.delete(record.id)),
  );
  await tx.done;
};
