import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import * as jobService from '../services/job.service';
import prisma from '../lib/prisma';
import * as escrowService from '../services/escrow.service';
import * as notificationService from '../services/notification.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const { user: currentUser } = req as Request & { user?: { id?: string; role?: Role } };
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (currentUser.role !== Role.CONTRACTOR) {
      return res.status(403).json({ message: 'Only contractors can create jobs.' });
    }
    
    const contractor = await prisma.contractor.findUnique({ where: { userId: currentUser.id } });
    if (!contractor) {
        return res.status(404).json({ message: 'Contractor profile not found.' });
    }

    const { homeownerEmail, ...jobData } = req.body;
    if (!homeownerEmail) {
      return res.status(400).json({ message: 'Homeowner email is required.' });
    }

    const homeownerUser = await prisma.user.findUnique({ where: { email: homeownerEmail } });
    if (!homeownerUser) {
      return res.status(404).json({ message: `No homeowner found with email ${homeownerEmail}.` });
    }
    
    const homeowner = await prisma.homeowner.findUnique({ where: { userId: homeownerUser.id } });
    if (!homeowner) {
      return res.status(404).json({ message: 'Homeowner profile not found.' });
    }

    const job = await jobService.createJob({ ...jobData, homeownerId: homeowner.id }, contractor.id, prisma, escrowService, notificationService);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { user: currentUser } = req as Request & { user?: { id?: string; role?: Role } };
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

    const { user: currentUser } = req as Request & { user?: { id?: string; role?: Role } };
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
