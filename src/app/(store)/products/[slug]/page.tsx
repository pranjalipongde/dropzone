import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import ProductGallery from "@/components/store/ProductGallery";
import AddToCart from "@/components/store/AddToCart";
import StarRating from "@/components/store/StarRating";
import ReviewsSection from "@/components/store/ReviewsSection";
import ProductCard from "@/components/store/ProductCard";

// cache() = one database query per request, even though both
// generateMetadata and the page itself call this function
const getProduct = cache(getProductBySlug);

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product not found — DropZone" };

  return {
    title: `${product.name} — DropZone`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // Session and related products don't depend on each other, so fetch together
  const [session, related] = await Promise.all([
    auth(),
    getRelatedProducts(product.categoryId, product.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-500">
        <Link
          href="/products"
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900 dark:text-neutral-100">
          {product.name}
        </span>
      </nav>

      {/* ── Gallery + product info ── */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* key resets the selected thumbnail when you move to another product */}
        <ProductGallery
          key={product.id}
          images={product.images}
          name={product.name}
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {product.category.name}
          </p>

          <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight">
            {product.name}
          </h1>

          {/* Rating summary: links down to the reviews section */}
          <a
            href="#reviews"
            className="mt-3 inline-flex items-center gap-2 group"
          >
            <StarRating rating={product.averageRating} />
            <span className="text-sm text-neutral-500 group-hover:underline">
              {product.reviewCount > 0
                ? `${product.averageRating.toFixed(1)} (${product.reviewCount} ${product.reviewCount === 1 ? "review" : "reviews"})`
                : "No reviews yet"}
            </span>
          </a>

          <p className="mt-6 font-display text-4xl font-bold">
            ${product.price.toFixed(2)}
          </p>

          <p className="mt-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <AddToCart
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                stock: product.stock,
                image: product.images[0],
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <ReviewsSection
        productId={product.id}
        reviews={product.reviews}
        reviewCount={product.reviewCount}
        averageRating={product.averageRating}
        distribution={product.distribution}
        isLoggedIn={!!session?.user}
      />

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="font-display text-2xl font-bold">
            You might also like
          </h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
