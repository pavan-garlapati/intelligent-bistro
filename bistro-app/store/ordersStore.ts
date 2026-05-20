import { create } from 'zustand';
import type { CartItem, Order } from '../types';

interface OrdersStore {
  orders: Order[];
  addOrder: (data: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
  }) => Order;
  clearOrders: () => void;
}

function generateOrderId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  ).toUpperCase();
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  addOrder: ({ items, subtotal, tax, total }) => {
    const order: Order = {
      id: generateOrderId(),
      items: items.map((i) => ({ ...i })),
      subtotal,
      tax,
      total,
      placedAt: Date.now(),
    };
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },
  clearOrders: () => set({ orders: [] }),
}));
