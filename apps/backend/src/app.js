import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import indexRoutes from './routes/index.js';
// import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(helmet());
app.use(rateLimiterMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', requestId: req.requestId });
});

app.use('/api/v1', indexRoutes);

// app.use(errorHandler);

export default app;
