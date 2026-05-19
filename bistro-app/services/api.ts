import type {
  CartTotals,
  ChatResponse,
  GroupedMenu,
} from '../types';
import { API_BASE } from '../constants/config';

const BASE_URL = API_BASE;

export const NETWORK_ERROR_MESSAGE = 'No internet connection';

function isOfflineError(err: unknown): boolean {
  if (!(err instanceof TypeError)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('network request failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error')
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    if (isOfflineError(err)) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
    const reason = err instanceof Error ? err.message : 'Unknown network error';
    throw new Error(`Network error: ${reason}`);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export function fetchMenu(): Promise<GroupedMenu> {
  return request<GroupedMenu>('/menu');
}

export function sendChatMessage(
  message: string,
  sessionId: string,
): Promise<ChatResponse> {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

export function addToCart(
  sessionId: string,
  itemId: string,
  quantity: number,
): Promise<CartTotals> {
  return request<CartTotals>(`/cart/${sessionId}/add`, {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity }),
  });
}

export function removeFromCart(
  sessionId: string,
  itemId: string,
): Promise<CartTotals> {
  return request<CartTotals>(`/cart/${sessionId}/remove`, {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

export function updateCartItem(
  sessionId: string,
  itemId: string,
  quantity: number,
): Promise<CartTotals> {
  return request<CartTotals>(`/cart/${sessionId}/update`, {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity }),
  });
}

export function clearCart(sessionId: string): Promise<CartTotals> {
  return request<CartTotals>(`/cart/${sessionId}`, {
    method: 'DELETE',
  });
}

export { BASE_URL };
