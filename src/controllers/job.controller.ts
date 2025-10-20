import { Request, Response } from 'express';
import { Role, JobStatus } from '@prisma/client';
import * as jobService from '../services/job.service';
import prisma from '../lib/prisma';
import * as escrowService from '../services/escrow.service';
import * as notificationService from '../services/notification.service';
import { getJobFees as getJobFeesService } from '../services/payout.service';
import { appConfig } from '../config/app.config';
import * as riskService from '../services/risk.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;
    if (!currentUser?.id || currentUser.role !== Role.CONTRACTOR) {
      return res.status(403).json({ message: 'Only contractors can create jobs.' });
    }

    const { homeownerEmail, ...jobData } = req.body ?? {};
    if (!homeownerEmail || typeof homeownerEmail !== 'string') {
      return res.status(400).json({ message: 'Homeowner email is required.' });
    }

    const contractor = await prisma.contractor.findUnique({ where: { userId: currentUser.id } });
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor profile not found.' });
    }

    const homeownerUser = await prisma.user.findUnique({ where: { email: homeownerEmail } });
    if (!homeownerUser) {
      return res.status(404).json({ message: `No homeowner found with email ${homeownerEmail}.` });
    }

    const homeowner = await prisma.homeowner.findUnique({ where: { userId: homeownerUser.id } });
    if (!homeowner) {
      return res.status(404).json({ message: 'Homeowner profile not found.' });
    }

    const job = await jobService.createJob(
      { ...jobData, homeownerId: homeowner.id },
      contractor.id,
      prisma,
      escrowService,
      notificationService,
    );

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: (error as Error).message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jobs = await jobService.getJobsByUser(currentUser.id, currentUser.role, prisma);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id, prisma);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (currentUser.role !== Role.ADMIN) {
      const permittedUserIds = new Set<string>();
      if (job.homeowner?.userId) {
        permittedUserIds.add(job.homeowner.userId);
      }
      if (job.contractor?.userId) {
        permittedUserIds.add(job.contractor.userId);
      }

      if (!permittedUserIds.has(currentUser.id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
};

export const getJobFees = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const breakdown = await getJobFeesService(req.params.id, currentUser.id, currentUser.role, prisma);
    res.status(200).json(breakdown);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const fundJob = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        homeowner: true,
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (currentUser.role !== Role.HOMEOWNER || job.homeowner?.userId !== currentUser.id) {
      return res.status(403).json({ message: 'Only the assigned homeowner can fund this job.' });
    }

    if (job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.COMPLETED) {
      return res.status(200).json({ message: 'Job already funded.', decision: 'ALLOW' });
    }

    const evaluation = await riskService.evaluateJobFundingRisk(job.id, prisma);

    if (evaluation.decision === 'BLOCK') {
      await riskService.notifyRiskDecision(evaluation, prisma);
      return res.status(409).json({
        message: `Funding blocked due to risk assessment. Contact ${appConfig.supportEmail} for assistance.`,
        decision: evaluation.decision,
        score: evaluation.score,
        reasons: evaluation.reasons,
        thresholds: evaluation.thresholds,
      });
    }

    if (evaluation.decision === 'FLAG') {
      await riskService.notifyRiskDecision(evaluation, prisma);
      return res.status(202).json({
        message: 'Funding flagged for manual review. We will re-check within 24 hours.',
        decision: evaluation.decision,
        score: evaluation.score,
        reasons: evaluation.reasons,
        thresholds: evaluation.thresholds,
      });
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.IN_PROGRESS },
    });

    return res.status(200).json({
      message: 'Funding approved and job is now in progress.',
      decision: evaluation.decision,
      score: evaluation.score,
      reasons: evaluation.reasons,
      thresholds: evaluation.thresholds,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Funding attempt failed', error: error.message });
  }
};

export const updateJobState = async (req: Request, res: Response) => {
  const currentUser = (req as Request & { user?: { id?: string; role?: Role } }).user;

  if (!currentUser?.id || currentUser.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Only admins can modify job state.' });
  }

  const { stateCode } = req.body ?? {};
  if (!stateCode || typeof stateCode !== 'string') {
    return res.status(400).json({ message: 'stateCode is required.' });
  }

  const normalizedState = stateCode.toUpperCase();
  if (!appConfig.allowedStates.includes(normalizedState)) {
    return res.status(400).json({ message: `State ${normalizedState} is not currently supported.` });
  }

  const existingJob = await prisma.job.findUnique({
    where: { id: req.params.id },
    select: { stateCode: true },
  });

  if (!existingJob) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  try {
    await jobService.refreshJobFees(req.params.id, normalizedState, prisma);

    await prisma.auditLog.create({
      data: {
        actorUserId: currentUser.id,
        entity: 'Job',
        entityId: req.params.id,
        action: 'STATE_OVERRIDE',
        metadata: {
          fromState: existingJob.stateCode,
          toState: normalizedState,
        },
      },
    });

    const updatedJob = await jobService.getJobById(req.params.id, prisma);
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update job state', error: (error as Error).message });
  }
};
