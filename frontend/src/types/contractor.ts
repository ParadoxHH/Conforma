export type ContractorSummary = {
  id: string;
  companyName: string | null;
  trades: string[];
  ratingAvg: number;
  ratingCount: number;
  verifiedKyc: boolean;
  verifiedLicense: boolean;
  verifiedInsurance: boolean;
  serviceAreas: string[];
  distanceMiles?: number | null;
  badges: {
    kyc: boolean;
    license: boolean;
    insurance: boolean;
  };
  avatarUrl: string | null;
  tagline: string | null;
};

export type ContractorSearchResponse = {
  total: number;
  page: number;
  pageSize: number;
  results: ContractorSummary[];
};

export type ContractorProfile = {
  id: string;
  companyName: string | null;
  trades: string[];
  serviceAreas: string[];
  portfolio: Array<{ title: string; url: string; type: string }> | null;
  ratingAvg: number;
  ratingCount: number;
  badges: {
    kyc: boolean;
    license: boolean;
    insurance: boolean;
  };
  avatarUrl: string | null;
  bio: string | null;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    homeowner: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
};
