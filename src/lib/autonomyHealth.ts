type CronJobName =
  | 'document_expiry'
  | 'invite_expiry'
  | 'milestone_approver'
  | 'search_sync'
  | 'weekly_digest'
  | 'nightly_backup'
  | 'restore_test';

type CronRunRecord = {
  job: CronJobName;
  ranAt: Date;
  notes?: string;
};

const cronRuns = new Map<CronJobName, CronRunRecord>();

export const recordCronRun = (job: CronJobName, notes?: string) => {
  cronRuns.set(job, {
    job,
    ranAt: new Date(),
    notes,
  });
};

export const getCronRuns = () => {
  return Array.from(cronRuns.values()).sort(
    (a, b) => b.ranAt.getTime() - a.ranAt.getTime(),
  );
};
