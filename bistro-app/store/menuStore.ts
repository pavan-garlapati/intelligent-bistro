import { create } from 'zustand';
import type { GroupedMenu, MenuItem } from '../types';
import { fetchMenu as fetchMenuApi } from '../services/api';

interface MenuStore {
  items: MenuItem[];
  grouped: GroupedMenu;
  isLoading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
}

const emptyGrouped: GroupedMenu = {
  starters: [],
  mains: [],
  drinks: [],
  desserts: [],
};

export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  grouped: emptyGrouped,
  isLoading: false,
  error: null,

  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const grouped = await fetchMenuApi();
      const items = [
        ...grouped.starters,
        ...grouped.mains,
        ...grouped.drinks,
        ...grouped.desserts,
      ];
      set({ items, grouped, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load menu';
      set({ isLoading: false, error: message });
    }
  },
}));
