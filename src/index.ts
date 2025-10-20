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
import evidenceRoutes from './routes/evidence.routes';
import notificationRoutes from './routes/notification.routes';
import billingRoutes from './routes/billing.routes';
import payoutRoutes from './routes/payout.routes';
import matchRoutes from './routes/match.routes';
import aiRoutes from './routes/ai.routes';
import configRoutes from './routes/config.routes';
import analyticsRoutes from './routes/analytics.routes';
import exportRoutes from './routes/export.routes';
import referralRoutes from './routes/referral.routes';
import autonomyRoutes from './routes/autonomy.routes';
import { startMilestoneApprover } from './jobs/milestone-approver';
import { startInviteExpiryJob } from './jobs/invite-expirer.job';
import { startContractorSearchSyncJob } from './jobs/search-sync.job';
import { startDocumentExpiryJob } from './jobs/document-expirer.job';
import { startWeeklyDigestJob } from './jobs/weekly-digest.job';
import { startBackupJobs } from './jobs/backup.job';
import { initializeInsuranceVerifier } from './services/insuranceVerifier';
import { startTelemetry, shutdownTelemetry, prometheusRequestHandler } from './otel';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

startTelemetry().catch((error) => {
  console.error('Telemetry initialization failed', error);
});

// --- Middleware ---
const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
const jsonParser = express.json();
const stripeWebhookParser = express.raw({ type: 'application/json' });

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
    return stripeWebhookParser(req, res, next);
  }
  return jsonParser(req, res, next);
});

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
app.use('/api/evidence', evidenceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/autonomy', autonomyRoutes);

app.get('/metrics', (req, res) => {
  return prometheusRequestHandler(req, res);
});

app.get('/', (req, res) => {
  res.send('Conforma API is running!');
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startMilestoneApprover();
  startInviteExpiryJob();
  startContractorSearchSyncJob();
  startDocumentExpiryJob();
  startWeeklyDigestJob();
  startBackupJobs();
  initializeInsuranceVerifier().catch((error) => {
    console.error('Failed to initialize insurance verifier', error);
  });
});

const gracefulShutdown = async () => {
  try {
    await shutdownTelemetry();
  } catch (error) {
    console.error('Telemetry shutdown failed', error);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);



