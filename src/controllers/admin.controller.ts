import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await adminService.getAllJobs();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

export const getAllDisputes = async (req: Request, res: Response) => {
  try {
    const disputes = await adminService.getAllDisputes();
    res.status(200).json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disputes' });
  }
};
