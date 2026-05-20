import { Router } from 'express';
import { loadMenu } from './menu.js';
import {
  processMessage,
  validateAndEnrichActions,
} from '../services/aiService.js';
import {
  getSession,
  addMessage,
  updateCart,
  applyActionToCart,
  resetSession,
} from '../services/sessionService.js';

const MAX_MESSAGE_LENGTH = 500;

function sanitizeMessage(text) {
  return text.replace(/<[^>]*>/g, '').trim().slice(0, MAX_MESSAGE_LENGTH);
}

function isValidSessionId(sid) {
  return (
    typeof sid === 'string' &&
    sid.length > 0 &&
    sid.length <= 64 &&
    /^[A-Za-z0-9_-]+$/.test(sid)
  );
}

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }
    if (!isValidSessionId(sessionId)) {
      return res
        .status(400)
        .json({ error: 'sessionId must be alphanumeric (max 64 chars)' });
    }

    const sanitized = sanitizeMessage(message);
    if (!sanitized) {
      return res.status(400).json({ error: 'message is empty after sanitization' });
    }

    const menu = await loadMenu();
    const session = getSession(sessionId);

    const priorHistory = session.history.slice();
    const aiResponse = await processMessage(
      sanitized,
      priorHistory,
      menu,
      session.cart,
    );

    const validatedActions = validateAndEnrichActions(aiResponse.actions, menu);

    const menuById = new Map(menu.map((item) => [item.id, item]));
    let nextCart = session.cart;
    for (const action of validatedActions) {
      const menuItem = action.itemId ? menuById.get(action.itemId) : null;
      nextCart = applyActionToCart(nextCart, action, menuItem);
    }

    const placedOrder = validatedActions.some((a) => a.type === 'place_order');

    if (placedOrder) {
      resetSession(sessionId);
    } else {
      updateCart(sessionId, nextCart);
      addMessage(sessionId, 'user', sanitized);
      addMessage(sessionId, 'assistant', aiResponse.reply);
    }

    res.json({
      reply: aiResponse.reply,
      actions: validatedActions,
      updatedCart: nextCart,
      suggestions: aiResponse.suggestions,
      sessionId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
