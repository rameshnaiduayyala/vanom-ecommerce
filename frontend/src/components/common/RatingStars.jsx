import React from "react";
import { Star } from "lucide-react";

/**
 * Reusable RatingStars component
 */
export function RatingStars({
  rating = 4.5,
  reviewsCount,
  showScore = true,
  size = "sm",
  className = "",
}) {
  const numRating = Number(rating) || 0;
  const rounded = Math.round(numRating);

  const starSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const starClass = starSizes[size] || starSizes.sm;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${numRating} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${
              star <= rounded
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-100"
            } transition-colors`}
          />
        ))}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-amber-700">
          {numRating.toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-[11px] text-text-muted">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}

export default RatingStars;
