import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../server.ts';

export default function handler(req: VercelRequest, res: VercelResponse) {
  (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
