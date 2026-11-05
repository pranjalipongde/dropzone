"use client";

import { useState } from "react";
import { Minus, Plus, Check, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface AddToCartProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
  };
}

export default function AddToCart({ product }: AddToCartProps) {
  const addItem = useCartStore((s) => s.addItem);

  // How many of this product are already in the cart (0 if none)
  const inCart = useCartStore(
    (s) =>
      s.items.find((i: { id: string; quantity: number }) => i.id === product.id)
        ?.quantity ?? 0,
  );

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Derived values: calculated every render, never stored in state
  const soldOut = product.stock === 0;
  const remaining = product.stock - inCart; // how many more can be added
  const atLimit = !soldOut && remaining <= 0;
  const max = Math.max(remaining, 1);
  const safeQty = Math.min(quantity, max); // clamp if the cart changed underneath us

  function handleAdd() {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
      },
      safeQty,
    );
    setQuantity(1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  // ── Sold out ──
  if (soldOut) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-semibold cursor-not-allowed"
        >
          Sold out
        </button>
        <p className="text-sm text-neutral-500 text-center">
          This drop is gone. Waitlists are coming soon.
        </p>
      </div>
    );
  }

  const stepperButton =
    "w-10 h-10 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="space-y-4">
      {/* Stock message */}
      <p className="text-sm font-medium">
        {product.stock <= 10 ? (
          <span className="text-red-500">
            Only {product.stock} left, selling fast
          </span>
        ) : (
          <span className="text-green-600 dark:text-green-500">In stock</span>
        )}
      </p>

      <div className="flex items-center gap-3">
        {/* ── Quantity stepper ── */}
        <div className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, safeQty - 1))}
            disabled={atLimit || safeQty <= 1}
            aria-label="Decrease quantity"
            className={stepperButton}
          >
            <Minus size={16} />
          </button>

          <span
            className="w-10 text-center font-semibold tabular-nums"
            aria-live="polite"
          >
            {atLimit ? 0 : safeQty}
          </span>

          <button
            type="button"
            onClick={() => setQuantity(Math.min(max, safeQty + 1))}
            disabled={atLimit || safeQty >= max}
            aria-label="Increase quantity"
            className={stepperButton}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* ── Add button ── */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={atLimit}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-accent text-neutral-950 font-semibold hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {justAdded ? (
            <>
              <Check size={18} /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> Add to cart
            </>
          )}
        </button>
      </div>

      {/* Shown when the whole stock is already in the cart */}
      {atLimit && (
        <p className="text-sm text-neutral-500">
          You already have all {product.stock} in your cart.
        </p>
      )}
    </div>
  );
}
