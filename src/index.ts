import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import milestoneRoutes from './routes/milestone.routes';
import webhookRoutes from './routes/webhook.routes';
import disputeRoutes from './routes/dispute.routes';
import adminRoutes from './routes/admin.routes';
import { startMilestoneApprover } from './jobs/milestone-approver';

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
app.use('/api/milestones', milestoneRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Conforma API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startMilestoneApprover();
});
