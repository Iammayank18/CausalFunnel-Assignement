import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'ok',
    node: process.version,
    env: {
      hasFirebaseJson: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
  });
}
