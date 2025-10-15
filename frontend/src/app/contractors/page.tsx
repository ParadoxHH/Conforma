import { Suspense } from 'react';

import { ContractorSearchView } from './search-view';

type SearchParams = Record<string, string | string[] | undefined>;

const parseString = (params: SearchParams, key: string) => {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const parseNumber = (params: SearchParams, key: string) => {
  const value = parseString(params, key);
  if (!value) {
    return undefined;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return undefined;
  }
  return numeric;
};

const parseBoolean = (params: SearchParams, key: string) => {
  const value = parseString(params, key);
  return value === 'true';
};

export default function ContractorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const initialFilters = {
    trade: parseString(searchParams, 'trade'),
    zip: parseString(searchParams, 'zip'),
    radius: parseNumber(searchParams, 'radius'),
    verified: parseBoolean(searchParams, 'verified'),
    minRating: parseNumber(searchParams, 'minRating'),
    q: parseString(searchParams, 'q'),
    sort: (parseString(searchParams, 'sort') as 'rating' | 'distance' | 'recency' | undefined) ?? 'rating',
    page: parseNumber(searchParams, 'page') ?? 1,
  };

  return (
    <Suspense fallback={<div className="container px-4 py-16">Loading contractor search…</div>}>
      <ContractorSearchView initialFilters={initialFilters} />
    </Suspense>
  );
}
