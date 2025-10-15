import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import jobMessageRoutes from './routes/job-messages.routes';
import jobReviewRoutes from './routes/job-reviews.routes';
import milestoneRoutes from './routes/milestone.routes';
import webhookRoutes from './routes/webhook.routes';
import disputeRoutes from './routes/dispute.routes';
import adminRoutes from './routes/admin.routes';
import profileRoutes from './routes/profile.routes';
import searchRoutes from './routes/search.routes';
import inviteRoutes from './routes/invite.routes';
import documentRoutes from './routes/document.routes';
import notificationRoutes from './routes/notification.routes';
import { startMilestoneApprover } from './jobs/milestone-approver';
import { startInviteExpiryJob } from './jobs/invite-expirer.job';
import { startContractorSearchSyncJob } from './jobs/search-sync.job';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- API Documentation ---
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobMessageRoutes);
app.use('/api/jobs', jobReviewRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Conforma API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startMilestoneApprover();
  startInviteExpiryJob();
  startContractorSearchSyncJob();
});
