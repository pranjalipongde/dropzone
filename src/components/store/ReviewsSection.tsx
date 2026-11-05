import Link from "next/link";
import StarRating from "@/components/store/StarRating";
import ReviewForm from "@/components/store/ReviewForm";

interface ReviewsSectionProps {
  productId: string;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName: string;
  }[];
  reviewCount: number;
  averageRating: number;
  distribution: { star: number; count: number }[];
  isLoggedIn: boolean;
}

export default function ReviewsSection({
  productId,
  reviews,
  reviewCount,
  averageRating,
  distribution,
  isLoggedIn,
}: ReviewsSectionProps) {
  return (
    <section
      id="reviews"
      className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800"
    >
      <h2 className="font-display text-2xl font-bold">Customer reviews</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr]">
        {/* ── Left: summary ── */}
        <div>
          {reviewCount > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <div className="pb-1.5">
                  <StarRating rating={averageRating} size={18} />
                  <p className="mt-1 text-sm text-neutral-500">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* 5 → 1 star bars */}
              <div className="mt-6 space-y-2">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-3 tabular-nums">{star}</span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(count / reviewCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-neutral-500 tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-neutral-500">
              No reviews yet. Be the first to share your thoughts.
            </p>
          )}

          {/* Form or sign-in prompt */}
          <div className="mt-8">
            {isLoggedIn ? (
              <ReviewForm productId={productId} />
            ) : (
              <p className="text-sm text-neutral-500">
                <Link
                  href="/login"
                  className="font-semibold text-accent-dark hover:underline"
                >
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: review list ── */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="pb-6 border-b border-neutral-200 dark:border-neutral-800 last:border-0"
            >
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <time
                  className="text-xs text-neutral-400"
                  dateTime={review.createdAt}
                >
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="mt-2 text-sm font-semibold">{review.userName}</p>
              {review.comment && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
