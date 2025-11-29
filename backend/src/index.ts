import express from 'express';
import cors from 'cors';
import { quizRoutes } from './routes/quizzes.js';
import { schemaRoutes } from './routes/schemas.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/node-schemas', schemaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Workflow Quiz Backend running on http://localhost:${PORT}`);
});
