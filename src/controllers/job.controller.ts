import { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createJob = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id: userId, role } = req.user;
    if (role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Only contractors can create jobs.' });
    }
    
    const contractor = await prisma.contractor.findUnique({ where: { userId } });
    if (!contractor) {
        return res.status(404).json({ message: 'Contractor profile not found.' });
    }

    const job = await jobService.createJob(req.body, contractor.id);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id: userId, role } = req.user;
    const jobs = await jobService.getJobsByUser(userId, role);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
};
