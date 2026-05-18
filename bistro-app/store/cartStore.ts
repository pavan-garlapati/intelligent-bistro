import { create } from 'zustand';
import type { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  sessionId: string;
  subtotal: number;
  tax: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: (items: CartItem[]) => void;
  computeTotals: () => void;
}

const TAX_RATE = 0.08;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  sessionId: generateSessionId(),
  subtotal: 0,
  tax: 0,
  total: 0,

  computeTotals: () => {
    const items = get().items;
    const subtotal = round2(
      items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    );
    const tax = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + tax);
    set({ subtotal, tax, total });
  },

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.itemId === item.itemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.itemId === item.itemId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    });
    get().computeTotals();
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.itemId !== itemId),
    }));
    get().computeTotals();
  },

  updateQuantity: (itemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.itemId !== itemId) };
      }
      return {
        items: state.items.map((i) =>
          i.itemId === itemId ? { ...i, quantity } : i,
        ),
      };
    });
    get().computeTotals();
  },

  clearCart: () => {
    set({ items: [] });
    get().computeTotals();
  },

  syncCart: (items) => {
    set({ items });
    get().computeTotals();
  },
}));
