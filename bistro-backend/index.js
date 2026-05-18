import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import corsMiddleware from './src/middleware/cors.js';
import errorHandler from './src/middleware/errorHandler.js';
import menuRouter from './src/routes/menu.js';
import chatRouter from './src/routes/chat.js';
import cartRouter from './src/routes/cart.js';
import { clearOldSessions } from './src/services/sessionService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat requests, please slow down.' },
});

app.use('/api/menu', menuRouter);
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/cart', cartRouter);

setInterval(() => {
  const removed = clearOldSessions();
  if (removed > 0) console.log(`Cleared ${removed} stale session(s)`);
}, 15 * 60 * 1000).unref();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Bistro backend listening on port ${PORT}`);
});
