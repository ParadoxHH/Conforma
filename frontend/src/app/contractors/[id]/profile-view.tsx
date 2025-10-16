'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { ContractorProfile } from '@/types/contractor';
import { apiClient } from '@/lib/api-client';
import { BadgeRow } from '@/components/badge-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileResponse = ContractorProfile;

type ReviewsResponse = {
  total: number;
  page: number;
  pageSize: number;
  reviews: ContractorProfile['reviews'];
};

const inviteSchema = z.object({
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || /^\+1[0-9]{10}$/.test(value), 'Use +1########## format'),
  jobId: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const fetchProfile = async (contractorId: string) => {
  return apiClient.get<ProfileResponse>(`/profiles/contractors/${contractorId}`);
};

const fetchReviews = async (contractorId: string, page: number) => {
  return apiClient.get<ReviewsResponse>(`/profiles/contractors/${contractorId}/reviews`, {
    query: { page },
  });
};

type InvitePanelProps = {
  contractorId: string;
  onSuccess: () => void;
};

function InviteContractorPanel({ contractorId, onSuccess }: InvitePanelProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      phone: '',
      jobId: '',
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (values) => {
        await apiClient.post('/invites', {
          role: 'CONTRACTOR',
          email: values.email,
          phone: values.phone || undefined,
          jobId: values.jobId || undefined,
          contractorId,
          message: undefined,
        });
        onSuccess();
        reset();
      }),
    [contractorId, handleSubmit, onSuccess, reset],
  );

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
      <h3 className="text-lg font-semibold text-slate-900">Invite to your project</h3>
      <p className="mt-2 text-sm text-slate-600">
        Send a Conforma invite so this contractor can review your scope, accept milestones, and join the project.
      </p>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="contractor@company.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="invite-phone">Phone (optional)</Label>
          <Input
            id="invite-phone"
            placeholder="+15125551234"
            autoComplete="tel"
            {...register('phone')}
          />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="invite-job">Attach to job (optional)</Label>
          <Input
            id="invite-job"
            placeholder="Existing job ID"
            autoComplete="off"
            {...register('jobId')}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send invite'}
        </Button>
        {isSubmitSuccessful ? (
          <p className="text-xs text-success">
            Invitation sent. We\'ll email the contractor with instructions to join your project.
          </p>
        ) : null}
      </form>
    </div>
  );
}

type ContractorProfileViewProps = {
  contractorId: string;
};

export function ContractorProfileView({ contractorId }: ContractorProfileViewProps) {
  const [reviewPage, setReviewPage] = useState(1);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['contractor-profile', contractorId],
    queryFn: () => fetchProfile(contractorId),
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
  } = useQuery({
    queryKey: ['contractor-reviews', contractorId, reviewPage],
    queryFn: () => fetchReviews(contractorId, reviewPage),
    });

  if (isLoading || !profile) {
    return <div className="container px-4 py-16">Loading contractor…</div>;
  }

  const totalReviewPages = reviews ? Math.ceil(reviews.total / reviews.pageSize) : 1;

  return (
    <main className="bg-white/80 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-lg shadow-slate-900/10 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.companyName ?? 'Contractor avatar'}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {profile.companyName?.slice(0, 2).toUpperCase() ?? 'CO'}
                </div>
              )}
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Verified contractor
                </span>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  {profile.companyName ?? 'Conforma Contractor'}
                </h1>
                <p className="mt-1 text-sm text-slate-600">{profile.bio ?? 'Trusted Texas contractor on Conforma'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-500">Average rating</p>
              <p className="text-3xl font-semibold text-slate-900">
                {profile.ratingCount > 0 ? profile.ratingAvg.toFixed(1) : '--'}
              </p>
              <p className="text-xs text-slate-500">
                {profile.ratingCount > 0 ? `${profile.ratingCount} homeowner reviews` : 'Awaiting first review'}
              </p>
            </div>
          </div>
          <BadgeRow badges={profile.badges} className="mt-6" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <InviteContractorPanel contractorId={contractorId} onSuccess={() => setReviewPage(1)} />

          <section className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-900/10 backdrop-blur">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Service areas</h2>
              <p className="mt-2 text-sm text-slate-600">
                Operating across Texas counties and ZIP codes. Contact Conforma if you need coverage added.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.serviceAreas.map((zip) => (
                  <span key={zip} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {zip}
                  </span>
                ))}
              </div>
            </div>

            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Recent work</h2>
                  <span className="text-xs text-slate-500">{profile.portfolio.length} projects</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {profile.portfolio.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-700 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
                    >
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{item.type}</p>
                      <p className="mt-2 text-xs text-primary">View project �--</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Homeowner reviews</h2>
              {reviewsLoading && !reviews ? (
                <p className="mt-3 text-sm text-slate-600">Loading reviews…</p>
              ) : null}
              {reviews && reviews.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No reviews yet. Invite this contractor to your project to be first.</p>
              ) : null}
              <div className="mt-4 space-y-4">
                {reviews?.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.homeowner.displayName ?? 'Verified Homeowner'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{review.rating.toFixed(1)}</span>
                    </div>
                    {review.comment ? (
                      <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              {reviews && totalReviewPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {reviews.page} of {totalReviewPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviews.page <= 1 || reviewsFetching}
                      onClick={() => setReviewPage(Math.max(1, reviews.page - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviews.page >= totalReviewPages || reviewsFetching}
                      onClick={() => setReviewPage(reviews.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

