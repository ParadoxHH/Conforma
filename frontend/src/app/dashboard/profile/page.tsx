'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ProfileResponse = {
  id: string;
  email: string;
  role: 'CONTRACTOR' | 'HOMEOWNER' | 'ADMIN';
  avatarUrl: string | null;
  bio: string | null;
  contractor?: {
    id: string;
    companyName: string | null;
    trades: string[];
    serviceAreas: string[];
  } | null;
  homeowner?: {
    id: string;
    displayName: string | null;
    allowAlias: boolean;
  } | null;
};

const contractorSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  companyName: z.string().max(255).optional().or(z.literal('')),
  serviceAreas: z.string().optional().or(z.literal('')),
});

const homeownerSchema = z.object({
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  displayName: z.string().max(120).optional().or(z.literal('')),
  allowAlias: z.boolean().optional(),
});

export default function ProfilePage() {
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<ProfileResponse>('/profiles/me'),
  });

  const mutation = useMutation({
    mutationFn: (payload: unknown) => apiClient.put('/profiles/me', payload),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(data?.role === 'CONTRACTOR' ? contractorSchema : homeownerSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!data) return;
    if (data.role === 'CONTRACTOR') {
      reset({
        avatarUrl: data.avatarUrl ?? '',
        bio: data.bio ?? '',
        companyName: data.contractor?.companyName ?? '',
        serviceAreas: data.contractor?.serviceAreas.join(', ') ?? '',
      });
    } else {
      reset({
        avatarUrl: data.avatarUrl ?? '',
        bio: data.bio ?? '',
        displayName: data.homeowner?.displayName ?? '',
        allowAlias: data.homeowner?.allowAlias ?? true,
      });
    }
  }, [data, reset]);

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        if (!data) return;
        if (data.role === 'CONTRACTOR') {
          const payload = {
            avatarUrl: values.avatarUrl || null,
            bio: values.bio || null,
            companyName: values.companyName || null,
            serviceAreas: values.serviceAreas
              ? values.serviceAreas
                  .split(',')
                  .map((zip: string) => zip.trim())
                  .filter((zip: string) => zip.length > 0)
              : [],
          };
          await mutation.mutateAsync(payload);
        } else {
          const payload = {
            avatarUrl: values.avatarUrl || null,
            bio: values.bio || null,
            displayName: values.displayName || null,
            allowAlias: Boolean(values.allowAlias),
          };
          await mutation.mutateAsync(payload);
        }
      }),
    [data, handleSubmit, mutation],
  );

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {queryError instanceof Error ? queryError.message : 'Unable to load profile. Please try again after signing in.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
        <p className="mt-2 text-sm text-slate-600">Update the details your project partners will see.</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" placeholder="https://" autoComplete="url" {...register('avatarUrl')} />
          {errors.avatarUrl ? <p className="text-xs text-destructive">{String(errors.avatarUrl?.message ?? '')}</p> : null}
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} {...register('bio')} />
          {errors.bio ? <p className="text-xs text-destructive">{String(errors.bio?.message ?? '')}</p> : null}
        </div>
        {data.role === 'CONTRACTOR' ? (
          <>
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" autoComplete="organization" {...register('companyName')} />
              {errors.companyName ? <p className="text-xs text-destructive">{String(errors.companyName?.message ?? '')}</p> : null}
            </div>
            <div>
              <Label htmlFor="serviceAreas">Service ZIPs</Label>
              <Input id="serviceAreas" placeholder="78701, 78702" autoComplete="off" {...register('serviceAreas')} />
              <p className="mt-1 text-xs text-slate-500">Separate ZIP codes with commas.</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" autoComplete="nickname" {...register('displayName')} />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="allowAlias"
                type="checkbox"
                className="size-4 accent-primary"
                checked={Boolean(watch('allowAlias'))}
                onChange={(event) => setValue('allowAlias', event.target.checked)}
              />
              <Label htmlFor="allowAlias" className="text-sm text-slate-600">
                Show my reviews as "Verified Homeowner"
              </Label>
            </div>
          </>
        )}
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save profile'}
        </Button>
        {mutation.isSuccess ? <p className="text-xs text-success">Profile updated.</p> : null}
        {mutation.isError ? (
          <p className="text-xs text-destructive">{(mutation.error as Error).message ?? 'Unable to update profile.'}</p>
        ) : null}
      </form>
    </div>
  );
}

