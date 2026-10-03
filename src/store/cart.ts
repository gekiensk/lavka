// Корзина. Хранится в браузере (localStorage), поэтому сохраняется между визитами без регистрации.
// Цены здесь — только для показа: при оформлении заказа сервер берёт актуальные цены из базы.
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  stock: "IN_STOCK" | "ON_ORDER";
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  /** Обновить цены и наличие по свежим данным с сервера; исчезнувшие товары убрать */
  sync: (fresh: Omit<CartItem, "qty">[]) => void;
};

const MAX_QTY = 999;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) => (i.id === item.id ? { ...i, ...item, qty: Math.min(MAX_QTY, i.qty + qty) } : i)),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, Math.floor(qty) || 1)) } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      sync: (fresh) =>
        set((s) => ({
          items: s.items.flatMap((i) => {
            const f = fresh.find((x) => x.id === i.id);
            return f ? [{ ...i, ...f }] : [];
          }),
        })),
    }),
    { name: "santeh-lavka-cart" },
  ),
);

/**
 * true после загрузки страницы в браузере. Корзина живёт в localStorage,
 * поэтому до этого момента показываем «пустое» состояние, чтобы сервер и браузер нарисовали одно и то же.
 */
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true, // в браузере
    () => false, // на сервере и при первой отрисовке
  );
}

export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.qty, 0);
