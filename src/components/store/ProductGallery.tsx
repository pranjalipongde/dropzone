"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-4">
      {/* ── Main image ── */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[selected]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[selected]}
              alt={`${name}, image ${selected + 1} of ${images.length}`}
              fill
              priority={selected === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Thumbnails (hidden when there is only one image) ── */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === selected}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 transition-colors ${
                i === selected
                  ? "border-accent"
                  : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
