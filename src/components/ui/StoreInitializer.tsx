"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export default function StoreInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useCartStore.persist.rehydrate();
      useWishlistStore.persist.rehydrate();
      initialized.current = true;
    }
  }, []);

  return null;
}
