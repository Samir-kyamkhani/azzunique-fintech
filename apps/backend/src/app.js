import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import indexRoutes from './routes/index.js';
import { ApiError } from './lib/ApiError.js';
import { httpExceptionFilter } from './middleware/httpExceptionFilter.middleware.js';
import { httpResponseFilter } from './middleware/httpResponseFilter.middleware.js';

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3000',  'http://localhost:3001'],
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', requestId: req.requestId });
});

// ✅ Routes
app.use('/api/v1', indexRoutes);

// ❌ 404 handler (AFTER routes)
app.use((req, res, next) => {
  next(ApiError.notFound('Route not found'));
});

// ❌ GLOBAL ERROR HANDLER (ALWAYS LAST)
app.use(httpExceptionFilter);
export default app;
