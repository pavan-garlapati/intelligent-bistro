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
} from '../services/sessionService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const menu = await loadMenu();
    const session = getSession(sessionId);

    const priorHistory = session.history.slice();
    const aiResponse = await processMessage(
      message,
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

    updateCart(sessionId, nextCart);
    addMessage(sessionId, 'user', message);
    addMessage(sessionId, 'assistant', aiResponse.reply);

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
