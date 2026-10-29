"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  categories: { id: string; name: string; slug: string }[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read the current filter values straight from the URL
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  // The search box is the one exception: it needs local state so typing
  // feels instant, while the URL only updates after the debounce
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up any pending timer if the component unmounts
  useEffect(() => () => clearTimeout(timer.current), []);

  // Central helper: copy current params, apply changes, reset page, navigate
  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    params.delete("page"); // always go back to page 1 when filters change

    const query = params.toString();
    // startTransition keeps the old results visible while the new ones load
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function handleSearch(value: string) {
    setSearch(value); // update the input immediately
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateParams({ search: value.trim() });
    }, 400); // only touch the URL once typing pauses
  }

  function clearAll() {
    clearTimeout(timer.current);
    setSearch("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const hasFilters = !!(search || activeCategory || searchParams.get("sort"));

  return (
    <div
      className={`space-y-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      {/* ── Row 1: search + sort ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search drops..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
          />
        </div>

        <select
          value={activeSort}
          onChange={(e) =>
            updateParams({
              sort: e.target.value === "newest" ? "" : e.target.value,
            })
          }
          aria-label="Sort products"
          className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent transition cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Row 2: category pills ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => updateParams({ category: "" })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeCategory === ""
              ? "bg-accent text-neutral-950 border-accent"
              : "border-neutral-300 dark:border-neutral-700 hover:border-accent"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => updateParams({ category: cat.slug })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat.slug
                ? "bg-accent text-neutral-950 border-accent"
                : "border-neutral-300 dark:border-neutral-700 hover:border-accent"
            }`}
          >
            {cat.name}
          </button>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}
