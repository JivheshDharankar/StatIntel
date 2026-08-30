import express from 'express';
import cors from 'cors';
import { config, validateEnvironment } from './lib/config';
import healthRoutes from './routes/health.routes';
import competencyRoutes from './routes/competency.routes';
import profileRoutes from './routes/profile.routes';
import skillGapRoutes from './routes/skillGap.routes';
import recommendationRoutes from './routes/recommendation.routes';
import learningResourceRoutes from './routes/learningResource.routes';
import quizRoutes from './routes/quiz.routes';
import analyticsRoutes from './routes/analytics.routes';

// Validate environment on startup
const envValidation = validateEnvironment();
if (envValidation.warnings.length > 0) {
  envValidation.warnings.forEach(w => console.log(w));
}

export const app = express();

app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

app.use(express.json());

// Register API Routes
app.use('/api', healthRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skill-gaps', skillGapRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/learning-resources', learningResourceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback 404 handler
app.use((_req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API endpoint not found' 
  });
});
