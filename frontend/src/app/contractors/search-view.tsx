'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ContractorFiltersPanel, ContractorFilters } from '@/components/contractor-filters-panel';
import { ContractorCard } from '@/components/contractor-card';
import { BadgeRow } from '@/components/badge-row';
import { Button } from '@/components/ui/button';
import { ContractorSearchResponse, ContractorSummary } from '@/types/contractor';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type FiltersState = ContractorFilters & {
  page: number;
};

type ContractorSearchViewProps = {
  initialFilters: FiltersState;
};

const DEFAULT_FILTERS: FiltersState = {
  trade: undefined,
  zip: undefined,
  radius: undefined,
  verified: false,
  minRating: undefined,
  q: undefined,
  sort: 'rating',
  page: 1,
};

const buildQuery = (filters: FiltersState) => {
  const query: Record<string, string | number | boolean | undefined> = {
    trade: filters.trade || undefined,
    zip: filters.zip || undefined,
    radius: filters.radius,
    verified: filters.verified ? 'true' : undefined,
    minRating: filters.minRating,
    q: filters.q || undefined,
    sort: filters.sort,
    page: filters.page,
  };
  return query;
};

const fetchContractors = async (filters: FiltersState) => {
  return apiClient.get<ContractorSearchResponse>('/search/contractors', {
    query: buildQuery(filters),
  });
};

export function ContractorSearchView({ initialFilters }: ContractorSearchViewProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FiltersState>({ ...DEFAULT_FILTERS, ...initialFilters });

  const queryKey = useMemo(() => ['contractor-search', filters], [filters]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchContractors(filters),
    keepPreviousData: true,
  });

  const contractors: ContractorSummary[] = data?.results ?? [];

  const pushFiltersToUrl = (nextFilters: FiltersState) => {
    const params = new URLSearchParams();
    const query = buildQuery(nextFilters);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    const search = params.toString();
    router.replace(`/contractors${search ? `?${search}` : ''}`);
  };

  const handleFiltersSubmit = (updated: ContractorFilters) => {
    const nextFilters = {
      ...filters,
      ...updated,
      page: 1,
    };
    setFilters(nextFilters);
    pushFiltersToUrl(nextFilters);
  };

  const handlePageChange = (page: number) => {
    const nextFilters = { ...filters, page };
    setFilters(nextFilters);
    pushFiltersToUrl(nextFilters);
  };

  const showPagination = (data?.total ?? 0) > (data?.pageSize ?? 20);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <main className="bg-white/80 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Contractor marketplace</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Find verified Texas contractors</h1>
            <p className="mt-2 text-sm text-slate-600">
              Filter by trade, service area, and verification badges. Invite contractors directly to your project.
            </p>
          </div>
          <BadgeRow
            badges={{ kyc: true, license: true, insurance: true }}
            className="justify-start md:justify-end"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <ContractorFiltersPanel
            defaultValues={filters}
            onSubmit={handleFiltersSubmit}
            isLoading={isLoading || isFetching}
          />

          <section className="space-y-6">
            {contractors.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm shadow-slate-900/5">
                <h2 className="text-lg font-semibold text-slate-900">No contractors match these filters yet</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Try broadening your search criteria or invite a contractor directly by email.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => refetch()}>
                  Refresh results
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
            )}

            {showPagination ? (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600">
                <span>
                  Page {data?.page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1 || isFetching}
                    onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages || isFetching}
                    onClick={() => handlePageChange(filters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
