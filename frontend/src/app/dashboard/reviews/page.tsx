'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { apiClient } from '@/lib/api-client';
import { JobSummary } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProfileMe = {
  role: 'CONTRACTOR' | 'HOMEOWNER' | 'ADMIN';
  contractor?: { id: string } | null;
  homeowner?: { id: string } | null;
};

type ContractorReviewsResponse = {
  total: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    homeowner: {
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
};

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal('')),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const fetchProfile = () => apiClient.get<ProfileMe>('/profiles/me');
const fetchJobs = () => apiClient.get<JobSummary[]>('/jobs');

export default function ReviewsPage() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const { data: jobs } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });

  const contractorId = profile?.contractor?.id;

  const { data: contractorReviews } = useQuery({
    queryKey: ['contractor-reviews', contractorId],
    queryFn: () => apiClient.get<ContractorReviewsResponse>(`/profiles/contractors/${contractorId}/reviews`),
    enabled: Boolean(contractorId),
  });

  const homeownerId = profile?.homeowner?.id;

  const completedJobs =
    profile?.role === 'HOMEOWNER' && jobs
      ? jobs.filter((job) => job.status === 'COMPLETED' && !job.reviews?.some((review) => review.homeownerId === homeownerId))
      : [];

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: ReviewFormValues) =>
      apiClient.post(`/jobs/${selectedJobId}/reviews`, {
        rating: payload.rating,
        comment: payload.comment,
      }),
    onSuccess: () => {
      reset({ rating: 5, comment: '' });
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit((values) => {
        if (!selectedJobId) return;
        reviewMutation.mutate(values);
      }),
    [handleSubmit, reviewMutation, selectedJobId],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reviews</h1>
        <p className="mt-2 text-sm text-slate-600">
          Homeowners can leave a review for each completed job. Contractors see the latest feedback from their clients.
        </p>
      </div>

      {profile?.role === 'HOMEOWNER' ? (
        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Leave a review</h2>
          {completedJobs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              All completed jobs are reviewed. After your next project finishes, return here to share feedback.
            </p>
          ) : (
            <>
              <div className="mt-4">
                <Label htmlFor="jobSelect">Select job</Label>
                <Select value={selectedJobId ?? ''} onValueChange={(value) => setSelectedJobId(value)}>
                  <SelectTrigger id="jobSelect">
                    <SelectValue placeholder="Choose a completed job" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedJobId ? (
                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Select
                      defaultValue="5"
                      onValueChange={(value) => setValue('rating', Number(value), { shouldValidate: true })}
                    >
                      <SelectTrigger id="rating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rating ? <p className="text-xs text-destructive">{errors.rating.message}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment (optional)</Label>
                    <Textarea id="comment" rows={4} {...register('comment')} />
                    {errors.comment ? <p className="text-xs text-destructive">{errors.comment.message}</p> : null}
                  </div>
                  <Button type="submit" disabled={isSubmitting || reviewMutation.isPending}>
                    {reviewMutation.isPending ? 'Submitting…' : 'Submit review'}
                  </Button>
                  {reviewMutation.isSuccess ? (
                    <p className="text-xs text-success">Thank you! Your review has been submitted.</p>
                  ) : null}
                  {reviewMutation.isError ? (
                    <p className="text-xs text-destructive">
                      {(reviewMutation.error as Error).message ?? 'Unable to submit review.'}
                    </p>
                  ) : null}
                </form>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {profile?.role === 'CONTRACTOR' ? (
        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Recent homeowner feedback</h2>
          <div className="mt-4 space-y-4">
            {contractorReviews?.reviews.length ? (
              contractorReviews.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {review.homeowner.displayName ?? 'Verified Homeowner'}
                    </span>
                    <span className="text-primary">{review.rating.toFixed(1)}</span>
                  </div>
                  {review.comment ? <p className="mt-2 text-slate-600">{review.comment}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No reviews yet. Complete a project to start receiving feedback.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
