import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Importar rotas
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import eventsRoutes from './routes/events';
import clientsRoutes from './routes/clients';
import plansRoutes from './routes/plans';
import reportsRoutes from './routes/reports';

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
});
app.use('/api/', limiter);

// Middleware geral
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/reports', reportsRoutes);

// Middleware de erro 404
app.use(notFound);

// Middleware de tratamento de erro
app.use(errorHandler);

const PORT = config.port || 8000;

app.listen(PORT, () => {
  console.log(`🚀 MEEP Supremo Backend rodando na porta ${PORT}`);
  console.log(`📋 Environment: ${config.env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
});

export default app;
