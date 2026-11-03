import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

// Rebuild the URL, keeping every active filter and changing only the page
function buildHref(
  searchParams: PaginationProps["searchParams"],
  page: number,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });

  if (page > 1) params.set("page", String(page)); // page 1 is the default, so keep the URL clean

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

// Shows: 1 ... 4 5 6 ... 20 instead of listing all 20 pages
function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...wanted]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null; // nothing to paginate

  const pages = getPageNumbers(currentPage, totalPages);

  const arrowBase =
    "inline-flex items-center justify-center w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-12"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(searchParams, currentPage - 1)}
          aria-label="Previous page"
          className={`${arrowBase} hover:border-accent`}
        >
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span
          className={`${arrowBase} opacity-40 cursor-not-allowed`}
          aria-hidden="true"
        >
          <ChevronLeft size={18} />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(searchParams, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-accent text-neutral-950"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {page}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(searchParams, currentPage + 1)}
          aria-label="Next page"
          className={`${arrowBase} hover:border-accent`}
        >
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span
          className={`${arrowBase} opacity-40 cursor-not-allowed`}
          aria-hidden="true"
        >
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
