import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config';
import { connectDb } from './db';
import { errorHandler, notFound } from './middleware/error';
import authRouter from './routes/auth';
import paymentsRouter, { webhookHandler } from './routes/payments';
import statsRouter from './routes/stats';
import subscriptionsRouter from './routes/subscriptions';
import { startReminders } from './services/reminders';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler);
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/payments', paymentsRouter);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDb();
  app.listen(config.port, () => console.log(`Recurrly API listening on ${config.port}`));
  startReminders();
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
