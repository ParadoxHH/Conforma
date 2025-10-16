'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const contractorSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2),
  serviceAreas: z.string().min(1, 'Provide at least one service ZIP'),
  trades: z.array(z.string()).min(1, 'Select at least one trade'),
});

const homeownerSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^[0-9]{5}$/, 'Enter a 5 digit ZIP'),
});

type ContractorFormValues = {
  password: string;
  companyName: string;
  serviceAreas: string;
  trades: string[];
};
type HomeownerFormValues = z.infer<typeof homeownerSchema>;

type InviteDetails = {
  id: string;
  role: 'CONTRACTOR' | 'HOMEOWNER';
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  hasJob: boolean;
};

const tradeOptions = [
  { value: 'ROOFING', label: 'Roofing' },
  { value: 'HOME_IMPROVEMENT', label: 'Home Improvement' },
  { value: 'SOLAR', label: 'Solar' },
  { value: 'TREE_TRIMMING', label: 'Tree Trimming' },
  { value: 'MOVING', label: 'Moving' },
  { value: 'OTHER', label: 'Other' },
];

function fetchInvite(token: string) {
  return apiClient.get<InviteDetails>(`/invites/${token}`);
}

function AcceptContractorInvite({
  token,
  email,
  onSuccess,
}: {
  token: string;
  email: string;
  onSuccess: () => void;
}) {
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      companyName: '',
      serviceAreas: '',
      password: '',
      trades: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContractorFormValues) => {
      const serviceAreas = data.serviceAreas
        .split(',')
        .map((zip) => zip.trim())
        .filter(Boolean);

      return apiClient.post(`/invites/${token}/accept`, {
        password: data.password,
        companyName: data.companyName,
        serviceAreas,
        trades: data.trades,
      });
    },
    onSuccess,
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((values) => {
        mutation.mutate({
          ...values,
          trades: selectedTrades,
        });
      }),
    [handleSubmit, mutation, selectedTrades],
  );

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label>Email</Label>
        <Input value={email} readOnly autoComplete="email" name="email" />
      </div>
      <div>
        <Label htmlFor="password">Set password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="companyName">Company name</Label>
        <Input id="companyName" autoComplete="organization" {...register('companyName')} />
        {errors.companyName ? <p className="text-xs text-destructive">{errors.companyName.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="serviceAreas">Service ZIPs (comma separated)</Label>
        <Input id="serviceAreas" placeholder="78701, 78702" autoComplete="off" {...register('serviceAreas')} />
        {errors.serviceAreas ? (
          <p className="text-xs text-destructive">{String(errors.serviceAreas.message ?? '')}</p>
        ) : null}
      </div>
      <div>
        <Label>Trades</Label>
        <div className="flex flex-wrap gap-2">
          {tradeOptions.map((trade) => {
            const active = selectedTrades.includes(trade.value);
            return (
              <button
                key={trade.value}
                type="button"
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  active ? 'border-primary/40 bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-600',
                )}
                onClick={() => {
                  const next = active
                    ? selectedTrades.filter((value) => value !== trade.value)
                    : [...selectedTrades, trade.value];
                  setSelectedTrades(next);
                  setValue('trades', next);
                }}
              >
                {trade.label}
              </button>
            );
          })}
        </div>
        {errors.trades ? <p className="text-xs text-destructive">{errors.trades.message}</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Creating account...' : 'Accept invitation'}
      </Button>
      {mutation.isSuccess ? (
        <p className="text-xs text-success">Invitation accepted. You can now sign in to Conforma.</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-xs text-destructive">
          {(mutation.error as Error).message ?? 'Could not accept invitation. Try again later.'}
        </p>
      ) : null}
    </form>
  );
}

function AcceptHomeownerInvite({
  token,
  email,
  onSuccess,
}: {
  token: string;
  email: string;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HomeownerFormValues>({
    resolver: zodResolver(homeownerSchema),
    defaultValues: {
      password: '',
      displayName: '',
      address: '',
      city: '',
      state: 'TX',
      zip: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: HomeownerFormValues) =>
      apiClient.post(`/invites/${token}/accept`, {
        password: data.password,
        displayName: data.displayName,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
      }),
    onSuccess,
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((values) => {
        mutation.mutate(values);
      }),
    [handleSubmit, mutation],
  );

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label>Email</Label>
        <Input value={email} readOnly autoComplete="email" name="email" />
      </div>
      <div>
        <Label htmlFor="password">Set password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="displayName">Display name (optional)</Label>
        <Input id="displayName" autoComplete="nickname" {...register('displayName')} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" autoComplete="street-address" {...register('address')} />
        {errors.address ? <p className="text-xs text-destructive">{errors.address.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" autoComplete="address-level2" {...register('city')} />
          {errors.city ? <p className="text-xs text-destructive">{errors.city.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" maxLength={2} autoComplete="address-level1" {...register('state')} />
          {errors.state ? <p className="text-xs text-destructive">{errors.state.message}</p> : null}
        </div>
      </div>
      <div>
        <Label htmlFor="zip">ZIP</Label>
        <Input id="zip" autoComplete="postal-code" {...register('zip')} />
        {errors.zip ? <p className="text-xs text-destructive">{errors.zip.message}</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Creating account...' : 'Accept invitation'}
      </Button>
      {mutation.isSuccess ? (
        <p className="text-xs text-success">Invitation accepted. You can now sign in to Conforma.</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-xs text-destructive">
          {(mutation.error as Error).message ?? 'Could not accept invitation. Try again later.'}
        </p>
      ) : null}
    </form>
  );
}

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => fetchInvite(token),
  });

  const [accepted, setAccepted] = useState(false);

  if (isLoading) {
    return <div className="container px-4 py-16">Loading invitation...</div>;
  }

  if (isError || !data) {
    return (
      <div className="container px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Invitation not found</h1>
        <p className="mt-2 text-sm text-slate-600">The invitation link may have expired. Request a new one from Conforma.</p>
      </div>
    );
  }

  const expired = data.status === 'EXPIRED';
  const alreadyAccepted = data.status === 'ACCEPTED';

  return (
    <main className="bg-white/80 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/90 p-8 shadow-lg shadow-slate-900/10 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Conforma invitation</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Join Conforma as a {data.role.toLowerCase()}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Complete the steps below to create your Conforma account. The invite was sent to <strong>{data.email}</strong>.
          </p>

          {expired ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              This invitation has expired. Ask the job owner to send a new one.
            </div>
          ) : null}
          {alreadyAccepted || accepted ? (
            <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-success">
              Invitation accepted! You can now sign in to Conforma.
            </div>
          ) : null}

          {!expired && !alreadyAccepted && !accepted ? (
            <div className="mt-8 space-y-6">
              {data.role === 'CONTRACTOR' ? (
                <AcceptContractorInvite token={token} email={data.email} onSuccess={() => setAccepted(true)} />
              ) : (
                <AcceptHomeownerInvite token={token} email={data.email} onSuccess={() => setAccepted(true)} />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

