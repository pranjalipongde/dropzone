"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore, selectIsInWishlist } from "@/store/wishlist";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    category: { name: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isSaved = useWishlistStore(selectIsInWishlist(product.id));

  const image = product.images[0];
  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  // The minimal shape our Zustand stores expect
  const storeItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image,
    slug: product.slug,
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      {/* ── Image area ── */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800">
        <Link href={`/products/${product.slug}`} className="block h-full">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Stock badge */}
        {(soldOut || lowStock) && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
              soldOut
                ? "bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-accent text-neutral-950"
            }`}
          >
            {soldOut ? "Sold out" : `Only ${product.stock} left`}
          </span>
        )}

        {/* Wishlist heart: a sibling of the Link, not inside it */}
        <button
          type="button"
          onClick={() => toggleWishlist(storeItem)}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur hover:scale-110 transition-transform"
        >
          <Heart
            size={18}
            className={
              isSaved ? "fill-red-500 text-red-500" : "text-neutral-500"
            }
          />
        </button>
      </div>

      {/* ── Info area ── */}
      <div className="p-4">
        <p className="text-xs text-neutral-400 uppercase tracking-wider">
          {product.category.name}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-1 block font-display font-semibold leading-snug line-clamp-2 hover:text-accent-dark transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold">
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            onClick={() => addToCart(storeItem)}
            disabled={soldOut}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent text-neutral-950 hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
