import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  announcementId: string;
  title: string;
  price: number;
  image?: string;
  sellerName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (announcementId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        // Vérifier si l'item existe déjà
        if (!items.find((i) => i.announcementId === item.announcementId)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (announcementId) => {
        set({ items: get().items.filter((i) => i.announcementId !== announcementId) });
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price, 0);
      },
      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
