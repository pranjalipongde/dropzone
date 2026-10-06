import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price, image, slug }

      addItem: (product) => {
        const { items } = get();
        // Guard: don't add duplicates
        if (!items.find((i) => i.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      // Single function to use on a heart/save button — toggles on and off
      toggleItem: (product) => {
        const alreadySaved = get().items.some((i) => i.id === product.id);
        alreadySaved ? get().removeItem(product.id) : get().addItem(product);
      },
    }),
    {
      name: "dropzone-wishlist",
      skipHydration: true,
    },
  ),
);

// Selector helper
export const selectIsInWishlist = (id) => (state) =>
  state.items.some((i) => i.id === id);
