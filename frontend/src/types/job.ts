export type JobSummary = {
  id: string;
  title: string;
  status: string;
  contractor: {
    id: string;
    user: {
      email: string;
    };
  };
  reviews?: Array<{
    id: string;
    jobId: string;
    homeownerId: string;
    contractorId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
};
