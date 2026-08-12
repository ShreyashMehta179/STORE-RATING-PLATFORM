import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface RatingStarsProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const activeValue = hoverValue !== null ? hoverValue : value;
  const starLabels = ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeValue >= star;
          return (
            <motion.button
              key={star}
              type="button"
              disabled={readOnly}
              whileHover={!readOnly ? { scale: 1.25 } : undefined}
              whileTap={!readOnly ? { scale: 0.9 } : undefined}
              onClick={() => !readOnly && onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`${
                readOnly ? 'cursor-default' : 'cursor-pointer'
              } p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size]} transition-all duration-200 ${
                  isFilled
                    ? 'fill-accent-gold text-accent-gold drop-shadow-[0_0_6px_rgba(244,183,64,0.4)]'
                    : 'text-surface-border dark:text-slate-700 fill-transparent'
                }`}
              />
            </motion.button>
          );
        })}
      </div>
      {showLabel && activeValue > 0 && (
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
          {starLabels[activeValue - 1]}
        </span>
      )}
    </div>
  );
};
