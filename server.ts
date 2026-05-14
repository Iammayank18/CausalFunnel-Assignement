import dotenv from 'dotenv';
import mimi, { json, serveStatic } from 'mimi.js';
import type { MimiRequest, MimiResponse, NextFunction } from 'mimi.js';
import { mongodbManager } from 'mimi.js';
import path from 'path';
import { Event } from './models/Event';
import { z } from 'zod';

const EventSchemaZod = z.object({
  session_id: z.string().min(1),
  event_type: z.enum(['page_view', 'click']),
  url: z.string().url(),
  timestamp: z.string().datetime().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
});

const EventPayloadSchema = z.object({
  events: z.array(EventSchemaZod),
});

dotenv.config();
const app = mimi({
  docs: {
    info: { title: 'Analytics API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
});

app.use((req: MimiRequest, res: MimiResponse, next: NextFunction): void => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  next();
});

app.use(json());

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set');
} else {
  await mongodbManager
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err: unknown) => console.error('MongoDB not connected', err));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/events', async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    let payload = typeof body === 'string' ? JSON.parse(body) : body;

    const parsed = EventPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.format() });
    }

    await Event.insertMany(parsed.data.events);
    res.json({ success: true, inserted: parsed.data.events.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 20;
    const skip = (page - 1) * limit;

    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          totalEvents: { $sum: 1 },
          firstEvent: { $min: '$timestamp' },
          lastEvent: { $max: '$timestamp' },
        },
      },
      { $sort: { lastEvent: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/sessions/:sessionId/events', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.sessionId }).sort({ timestamp: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/heatmap', async (req, res) => {
  try {
    const url = req.query?.url;
    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanUrl = String(url).replace(/\/$/, '').split('?')[0].split('#')[0];
    const searchRegex = new RegExp('^' + escapeRegex(cleanUrl) + '\\/?(\\?.*)?(#.*)?$', 'i');

    const clicks = await Event.find(
      { event_type: 'click', url: { $regex: searchRegex } },
      'x y viewportWidth viewportHeight timestamp',
    ).lean();
    res.json(clicks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/urls', async (_req, res) => {
  try {
    const urls = await Event.aggregate([
      { $match: { event_type: 'click' } },
      { $group: { _id: '$url', clickCount: { $sum: 1 }, lastActive: { $max: '$timestamp' } } },
      { $sort: { clickCount: -1 } },
    ]);
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use((req: MimiRequest, res: MimiResponse, next: NextFunction): void => {
    if (req.url?.startsWith('/api')) {
      return next();
    }
    vite.middlewares(req as any, res as any, next);
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(serveStatic(distPath));
  app.use((_req: MimiRequest, res: MimiResponse) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  const server = app.listen(Number(process.env.PORT || 3000), () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${process.env.PORT || 3000} is already in use`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}
