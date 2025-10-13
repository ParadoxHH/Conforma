import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *               homeownerEmail:
 *                 type: string
 *               milestones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Job created successfully
 *       403:
 *         description: Forbidden, only contractors can create jobs
 */
router.post('/', jobController.createJob);

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: Get jobs for the current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of jobs
 */
router.get('/', jobController.getJobs);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by its ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single job object
 *       404:
 *         description: Job not found
 */
router.get('/:id', jobController.getJobById);

export default router;
