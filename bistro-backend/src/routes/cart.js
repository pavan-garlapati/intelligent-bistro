import { Router } from 'express';
import { loadMenu } from './menu.js';
import {
  getSession,
  updateCart,
  applyActionToCart,
  computeCartTotals,
} from '../services/sessionService.js';

const router = Router();

function respondWithCart(res, cart) {
  res.json(computeCartTotals(cart));
}

router.get('/:sessionId', (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId);
    respondWithCart(res, session.cart);
  } catch (err) {
    next(err);
  }
});

router.post('/:sessionId/add', async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body || {};
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const menu = await loadMenu();
    const menuItem = menu.find((m) => m.id === itemId);
    if (!menuItem) return res.status(404).json({ error: 'Item not found' });

    const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const session = getSession(req.params.sessionId);
    const nextCart = applyActionToCart(
      session.cart,
      { type: 'add_item', itemId, quantity: qty },
      menuItem,
    );
    updateCart(req.params.sessionId, nextCart);
    respondWithCart(res, nextCart);
  } catch (err) {
    next(err);
  }
});

router.post('/:sessionId/remove', (req, res, next) => {
  try {
    const { itemId } = req.body || {};
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const session = getSession(req.params.sessionId);
    const nextCart = applyActionToCart(
      session.cart,
      { type: 'remove_item', itemId },
      null,
    );
    updateCart(req.params.sessionId, nextCart);
    respondWithCart(res, nextCart);
  } catch (err) {
    next(err);
  }
});

router.post('/:sessionId/update', (req, res, next) => {
  try {
    const { itemId, quantity } = req.body || {};
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });
    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ error: 'quantity must be a number' });
    }

    const session = getSession(req.params.sessionId);
    const nextCart = applyActionToCart(
      session.cart,
      { type: 'update_qty', itemId, quantity: Math.floor(quantity) },
      null,
    );
    updateCart(req.params.sessionId, nextCart);
    respondWithCart(res, nextCart);
  } catch (err) {
    next(err);
  }
});

router.delete('/:sessionId', (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId);
    const nextCart = applyActionToCart(session.cart, { type: 'clear_cart' }, null);
    updateCart(req.params.sessionId, nextCart);
    respondWithCart(res, nextCart);
  } catch (err) {
    next(err);
  }
});

export default router;
