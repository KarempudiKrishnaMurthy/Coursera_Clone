import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  showValue?: boolean;
  ratingsCount?: number;
  size?: 'sm' | 'md';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  showValue = true,
  ratingsCount,
  size = 'sm',
}) => {
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div className="inline-flex items-center gap-1">
      {showValue && (
        <span className="font-bold text-amber-900 text-xs sm:text-sm">
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}
          />
        ))}
      </div>
      {ratingsCount !== undefined && (
        <span className="text-xs text-slate-500 font-normal">
          ({ratingsCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};
