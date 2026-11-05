import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 16 }: StarRatingProps) {
  const percent = (Math.max(0, Math.min(5, rating)) / 5) * 100;

  return (
    <div
      className="relative inline-flex"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {/* Empty stars (background layer) */}
      <div className="flex text-neutral-300 dark:text-neutral-700">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={size}
            fill="currentColor"
            strokeWidth={0}
            className="shrink-0"
          />
        ))}
      </div>

      {/* Filled stars (clipped to the rating percentage) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden flex text-accent-dark"
        style={{ width: `${percent}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={size}
            fill="currentColor"
            strokeWidth={0}
            className="shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
