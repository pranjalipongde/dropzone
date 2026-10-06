import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price, image, slug, quantity }

      // Add product — if already in cart, just increase quantity
      addItem: (product) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      // Remove product entirely from cart
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      // Change quantity — if set to 0 or below, remove the item
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      // Empty the cart — used after a successful order
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "dropzone-cart", // key used in localStorage
      skipHydration: true, // we handle hydration manually
    },
  ),
);

// ── Selector helpers ──────────────────────────────────────────────
// These are pure functions used inside components like:
// const total = useCartStore(selectTotalPrice)
// Zustand only re-renders the component when that specific value changes

export const selectTotalItems = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectTotalPrice = (state) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectIsInCart = (id) => (state) =>
  state.items.some((i) => i.id === id);
