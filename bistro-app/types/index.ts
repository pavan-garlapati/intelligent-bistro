export type Category = 'Starters' | 'Mains' | 'Drinks' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  tags: string[];
  emoji: string;
  available: boolean;
}

export interface GroupedMenu {
  starters: MenuItem[];
  mains: MenuItem[];
  drinks: MenuItem[];
  desserts: MenuItem[];
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export interface CartTotals {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export type ActionType =
  | 'add_item'
  | 'remove_item'
  | 'update_qty'
  | 'clear_cart'
  | 'place_order'
  | 'no_action';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  placedAt: number;
}

export interface Action {
  type: ActionType;
  itemId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  reason?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVoice?: boolean;
  actions?: Action[];
  suggestions?: string[];
}

export interface ChatResponse {
  reply: string;
  actions: Action[];
  updatedCart: CartItem[];
  suggestions: string[];
  sessionId: string;
}
