import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import indexRoutes from './routes/index.js';
import { ApiError } from './lib/ApiError.js';
import { httpExceptionFilter } from './middleware/httpExceptionFilter.middleware.js';
import { httpResponseFilter } from './middleware/httpResponseFilter.middleware.js';
import { tenantContextMiddleware } from './middleware/tenantContext.middleware.js';

const app = express();

app.get('/api/v1/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
    credentials: true,
  }),
);

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(helmet());
app.use(rateLimiterMiddleware);

app.use(httpResponseFilter);

// Routes
app.use('/api/v1', tenantContextMiddleware, indexRoutes);

// 404
app.use((req, res, next) => {
  next(ApiError.notFound('Route not found'));
});

// Global error handler
app.use(httpExceptionFilter);

export default app;
