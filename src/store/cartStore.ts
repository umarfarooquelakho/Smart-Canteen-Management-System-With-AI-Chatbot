import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, qty?: number) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  updateInstruction: (itemId: string, instruction: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.menu_item.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menu_item.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, item.available_quantity) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { menu_item: item, quantity: qty }] };
        });
      },

      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menu_item.id !== itemId) })),

      updateQty: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menu_item.id === itemId
              ? { ...i, quantity: Math.min(qty, i.menu_item.available_quantity) }
              : i
          ),
        }));
      },

      updateInstruction: (itemId, instruction) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menu_item.id === itemId ? { ...i, special_instruction: instruction } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'fatafat_food_cart' }
  )
);

