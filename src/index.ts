import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import milestoneRoutes from './routes/milestone.routes';
import webhookRoutes from './routes/webhook.routes';
import disputeRoutes from './routes/dispute.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/disputes', disputeRoutes);

app.get('/', (req, res) => {
  res.send('Conforma API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
