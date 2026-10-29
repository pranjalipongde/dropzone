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
