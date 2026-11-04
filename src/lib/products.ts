import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const PRODUCTS_PER_PAGE = 12;

export type SortOption = "newest" | "price-asc" | "price-desc" | "name";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: SortOption;
  page?: number;
}

// Maps the ?sort= value in the URL to a Prisma orderBy clause
function getOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "name":
      return { name: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts(filters: ProductFilters) {
  const { search, category, sort, page = 1 } = filters;

  // Build the WHERE clause only with filters that were actually provided
  const where: Prisma.ProductWhereInput = {
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(category && {
      category: { slug: category },
    }),
  };

  // Run both queries in parallel instead of one after another
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    // Convert Decimal -> number so it can cross the server/client boundary
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      images: p.images as string[],
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ── Single product (detail page) ─────────────────────────────────
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        // Only the name. Never send email or passwordHash to the browser.
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!product) return null;

  const reviewCount = product.reviews.length;

  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // [{ star: 5, count: 3 }, { star: 4, count: 1 }, ...] for the rating bars
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  return {
    ...product,
    price: Number(product.price),
    images: product.images as string[],
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name ?? "Anonymous",
    })),
    reviewCount,
    averageRating,
    distribution,
  };
}

// ── Related products (same category, excluding the current one) ──
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
) {
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    images: p.images as string[],
  }));
}
