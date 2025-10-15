export type ChatMessage = {
  id: string;
  jobId: string;
  body: string;
  attachments?: Array<{ url: string; type: string }>;
  createdAt: string;
  readByUserIds: string[];
  sender: {
    id: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
};
