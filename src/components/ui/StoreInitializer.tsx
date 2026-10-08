"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export default function StoreInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    // useRef guards against this running twice in React Strict Mode
    if (!initialized.current) {
      useCartStore.persist.rehydrate();
      useWishlistStore.persist.rehydrate();
      initialized.current = true;
    }
  }, []);

  // Renders nothing — this is a logic-only component
  return null;
}
