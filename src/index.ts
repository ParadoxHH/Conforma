import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import milestoneRoutes from './routes/milestone.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/milestones', milestoneRoutes);

app.get('/', (req, res) => {
  res.send('Conforma API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
