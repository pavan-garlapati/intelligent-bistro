import { Router } from 'express';
import { resetSession } from '../services/sessionService.js';

const router = Router();

function isValidSessionId(sid) {
  return (
    typeof sid === 'string' &&
    sid.length > 0 &&
    sid.length <= 64 &&
    /^[A-Za-z0-9_-]+$/.test(sid)
  );
}

router.post('/reset', (req, res) => {
  const { sessionId } = req.body || {};
  if (!isValidSessionId(sessionId)) {
    return res
      .status(400)
      .json({ error: 'sessionId must be alphanumeric (max 64 chars)' });
  }
  resetSession(sessionId);
  res.json({ success: true });
});

export default router;
