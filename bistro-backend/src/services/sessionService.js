const MAX_HISTORY = 20;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const sessions = new Map();

export function getSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      history: [],
      cart: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    sessions.set(sessionId, session);
  }
  return session;
}

export function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);
  session.history.push({ role, content, timestamp: Date.now() });
  if (session.history.length > MAX_HISTORY) {
    session.history = session.history.slice(-MAX_HISTORY);
  }
  session.updatedAt = Date.now();
  return session.history;
}

export function updateCart(sessionId, cart) {
  const session = getSession(sessionId);
  session.cart = Array.isArray(cart) ? cart : [];
  session.updatedAt = Date.now();
  return session.cart;
}

export function resetSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.history = [];
    session.cart = [];
    session.updatedAt = Date.now();
  }
  return session;
}

export function clearOldSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  let removed = 0;
  for (const [id, session] of sessions) {
    if (session.updatedAt < cutoff) {
      sessions.delete(id);
      removed++;
    }
  }
  return removed;
}

export function _sessionsForTesting() {
  return sessions;
}

const TAX_RATE = 0.08;

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function applyActionToCart(cart, action, menuItem) {
  const next = cart.map((line) => ({ ...line }));

  switch (action.type) {
    case 'add_item': {
      if (!menuItem) return next;
      const qty = Math.max(1, Math.floor(action.quantity || 1));
      const existing = next.find((line) => line.itemId === menuItem.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        next.push({
          itemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: qty,
          emoji: menuItem.emoji,
        });
      }
      return next;
    }
    case 'remove_item': {
      const itemId = action.itemId || menuItem?.id;
      return next.filter((line) => line.itemId !== itemId);
    }
    case 'update_qty': {
      const itemId = action.itemId || menuItem?.id;
      const qty = Math.floor(action.quantity ?? 0);
      const idx = next.findIndex((line) => line.itemId === itemId);
      if (idx === -1) return next;
      if (qty <= 0) {
        next.splice(idx, 1);
      } else {
        next[idx].quantity = qty;
      }
      return next;
    }
    case 'clear_cart':
      return [];
    case 'no_action':
    default:
      return next;
  }
}

export function computeCartTotals(cart) {
  const subtotalRaw = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const subtotal = round2(subtotalRaw);
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  return { cart, subtotal, tax, total };
}
