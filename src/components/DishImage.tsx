import React, { useEffect, useState } from 'react';
import type { FoodItem } from '../types/food';
import { DishIllustration } from './DishIllustration';

interface DishImageProps {
  food: FoodItem;
  className?: string;
  eager?: boolean;
}

export const DishImage: React.FC<DishImageProps> = ({
  food,
  className = '',
  eager = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [food.id, food.imageUrl]);

  const hasPhoto = Boolean(food.imageUrl) && !failed;

  return (
    <div className={`relative overflow-hidden bg-[#FFEAF0]/40 dark:bg-[#2E242D] ${className}`}>
      {/* Bespoke dish-specific artwork serves as instant placeholder and offline/error fallback */}
      <DishIllustration visual={food.visual} dishId={food.id} />

      {hasPhoto && !loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {hasPhoto && (
        <img
          src={food.imageUrl}
          alt={food.imageAlt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
