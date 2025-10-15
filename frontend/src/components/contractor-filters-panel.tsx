'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  trade: z.string().optional(),
  zip: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9]{5}$/.test(value), 'Enter a 5 digit ZIP code'),
  radius: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0), {
      message: 'Radius must be a positive number',
    }),
  verified: z.boolean().optional(),
  minRating: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0 && value <= 5), {
      message: 'Rating must be between 0 and 5',
    }),
  q: z.string().optional(),
  sort: z.enum(['rating', 'distance', 'recency']).optional(),
});

export type ContractorFilters = z.infer<typeof schema>;
type ContractorFiltersFormValues = z.input<typeof schema>;

const toFormValues = (values: Partial<ContractorFilters>): Partial<ContractorFiltersFormValues> => ({
  trade: values.trade,
  zip: values.zip,
  radius: values.radius !== undefined && values.radius !== null ? String(values.radius) : undefined,
  verified: values.verified,
  minRating:
    values.minRating !== undefined && values.minRating !== null ? String(values.minRating) : undefined,
  q: values.q,
  sort: values.sort,
});

type FiltersPanelProps = {
  defaultValues: Partial<ContractorFilters>;
  onSubmit: (filters: ContractorFilters) => void;
  isLoading?: boolean;
  className?: string;
};

const tradeOptions = [
  { value: '', label: 'All trades' },
  { value: 'ROOFING', label: 'Roofing' },
  { value: 'HOME_IMPROVEMENT', label: 'Home Improvement' },
  { value: 'SOLAR', label: 'Solar' },
  { value: 'TREE_TRIMMING', label: 'Tree Trimming' },
  { value: 'MOVING', label: 'Moving' },
  { value: 'OTHER', label: 'Other' },
];

export function ContractorFiltersPanel({ defaultValues, onSubmit, isLoading, className }: FiltersPanelProps) {
  const defaultFormValues = useMemo(() => toFormValues(defaultValues), [defaultValues]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ContractorFiltersFormValues, undefined, ContractorFilters>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  });

  const verified = watch('verified');

  const submit = useMemo(
    () =>
      handleSubmit((values) => {
        onSubmit({
          ...values,
          verified: Boolean(values.verified),
        });
      }),
    [handleSubmit, onSubmit],
  );

  return (
    <aside
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur',
        className,
      )}
    >
      <form className="space-y-6" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input id="q" placeholder="Search by name or keyword" {...register('q')} />
          {errors.q ? <p className="text-xs text-destructive">{errors.q.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="trade">Trade</Label>
          <Select
            defaultValue={defaultValues.trade ?? ''}
            onValueChange={(value) => setValue('trade', value || undefined, { shouldDirty: true })}
          >
            <SelectTrigger id="trade">
              <SelectValue placeholder="All trades" />
            </SelectTrigger>
            <SelectContent>
              {tradeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" placeholder="78701" maxLength={5} {...register('zip')} />
            {errors.zip ? <p className="text-xs text-destructive">{errors.zip.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="radius">Radius (mi)</Label>
            <Input id="radius" type="number" min={0} step={5} placeholder="25" {...register('radius')} />
            {errors.radius ? <p className="text-xs text-destructive">{errors.radius.message}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minRating">Minimum rating</Label>
          <Input id="minRating" type="number" min={0} max={5} step={0.5} placeholder="4.0" {...register('minRating')} />
          {errors.minRating ? <p className="text-xs text-destructive">{errors.minRating.message}</p> : null}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Verified only</p>
            <p className="text-xs text-slate-500">Show contractors with all verification badges</p>
          </div>
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={Boolean(verified)}
            onChange={(event) => setValue('verified', event.target.checked, { shouldDirty: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select
            defaultValue={defaultValues.sort ?? 'rating'}
            onValueChange={(value) => setValue('sort', value as ContractorFilters['sort'], { shouldDirty: true })}
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="recency">Recency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Apply filters'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(toFormValues(defaultValues))}
            disabled={!isDirty}
          >
            Reset
          </Button>
        </div>
      </form>
    </aside>
  );
}
