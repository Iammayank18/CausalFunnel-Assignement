import app from './api/app.js';
import { serveStatic } from 'mimi.js';
import type { MimiRequest, MimiResponse, NextFunction } from 'mimi.js';
import path from 'path';

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
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(serveStatic(distPath));
  app.use((_req: MimiRequest, res: MimiResponse) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

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
