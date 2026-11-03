import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getCategories, type SortOption } from "@/lib/products";
import ProductCard from "@/components/store/ProductCard";
import FilterBar from "@/components/store/FilterBar";
import Pagination from "@/components/store/Pagination";

export const metadata = {
  title: "Shop All Drops — DropZone",
  description: "Browse limited streetwear drops, sneakers, hoodies and more.",
};

const VALID_SORTS: SortOption[] = ["newest", "price-asc", "price-desc", "name"];

// In Next.js 15+, searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;

  // URLs can contain repeated keys (?a=1&a=2). Keep only the first value.
  const params: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    params[key] = Array.isArray(value) ? value[0] : value;
  }

  // ── Validate everything that came from the URL ──
  const parsedPage = parseInt(params.page ?? "1", 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const sort = VALID_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : undefined;

  // Fetch products and categories at the same time
  const [{ products, totalCount, totalPages, currentPage }, categories] =
    await Promise.all([
      getProducts({
        search: params.search,
        category: params.category,
        sort,
        page,
      }),
      getCategories(),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* ── Heading ── */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          All <span className="text-accent">Drops</span>
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {totalCount} {totalCount === 1 ? "product" : "products"}
        </p>
      </div>

      {/* ── Filters (client component, needs Suspense) ── */}
      <Suspense
        fallback={
          <div className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
        }
      >
        <FilterBar categories={categories} />
      </Suspense>

      {/* ── Grid or empty state ── */}
      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center py-16">
          <p className="font-display text-2xl font-semibold">No drops found</p>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Try a different search or clear your filters.
          </p>
          <Link
            href="/products"
            className="inline-block mt-6 px-6 py-2.5 rounded-full bg-accent text-neutral-950 font-semibold hover:bg-accent-dark transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={params}
      />
    </div>
  );
}
