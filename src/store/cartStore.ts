import { create } from 'zustand';
import { Course } from '../types';

interface CartState {
  items: Course[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (course: Course) => {
    const { items } = get();
    if (!items.some((i) => i.id === course.id)) {
      set({ items: [...items, course] });
    }
  },

  removeItem: (courseId: string) => {
    set({ items: get().items.filter((i) => i.id !== courseId) });
  },

  clearCart: () => {
    set({ items: [] });
  },

  isInCart: (courseId: string) => {
    return get().items.some((i) => i.id === courseId);
  },

  totalPrice: () => {
    return Number(get().items.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  },
}));
