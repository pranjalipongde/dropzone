"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // star under the mouse, for the preview
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setDone(true);
    router.refresh(); // re-run the server page so the new review shows in the list
  }

  if (done) {
    return (
      <div className="p-4 rounded-xl bg-accent/20 text-sm font-medium">
        Thanks for your review!
      </div>
    );
  }

  const shown = hover || rating; // preview on hover, otherwise the chosen rating

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-display font-semibold">Write a review</p>

      {/* ── Star picker ── */}
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              size={28}
              strokeWidth={1.5}
              className={
                star <= shown
                  ? "fill-accent-dark text-accent-dark"
                  : "text-neutral-300 dark:text-neutral-600"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="What did you think? (optional)"
        className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 rounded-full bg-accent text-neutral-950 font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Posting..." : "Post review"}
      </button>
    </form>
  );
}
