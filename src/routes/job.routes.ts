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
 * /api/jobs/{id}/fund:
 *   post:
 *     summary: Attempt to fund a job after risk checks
 *     tags: [Jobs]
     security:
       - bearerAuth: []
     parameters:
       - in: path
         name: id
         required: true
         schema:
           type: string
     responses:
       200:
         description: Funding allowed
       202:
         description: Funding flagged for manual review
       409:
         description: Funding blocked due to risk assessment
 */
router.post('/:id/fund', jobController.fundJob);

/**
 * @openapi
 * /api/jobs/{id}/state:
 *   put:
 *     summary: Admin override job state configuration
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateCode:
 *                 type: string
 *                 example: TX
 *     responses:
 *       200:
 *         description: Updated job with new state rules
 *       403:
 *         description: Forbidden
 */
router.put('/:id/state', jobController.updateJobState);

/**
 * @openapi
 * /api/jobs/{id}/fees:
 *   get:
 *     summary: Get job fee breakdown
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
 *         description: Fee breakdown
 *       403:
 *         description: Not allowed
 */
router.get('/:id/fees', jobController.getJobFees);

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
