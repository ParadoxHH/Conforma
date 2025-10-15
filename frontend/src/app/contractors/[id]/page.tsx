import { Suspense } from 'react';

import { ContractorProfileView } from './profile-view';

type ContractorProfilePageProps = {
  params: { id: string };
};

export default function ContractorProfilePage({ params }: ContractorProfilePageProps) {
  return (
    <Suspense fallback={<div className=\"container px-4 py-16\">Loading contractor…</div>}>
      <ContractorProfileView contractorId={params.id} />
    </Suspense>
  );
}
