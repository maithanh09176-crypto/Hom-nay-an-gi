import React, { useEffect } from 'react';
import { Check, Heart, X } from 'lucide-react';
import type { FoodItem, MealTime } from '../types/food';
import { CATEGORY_LABELS, MEAL_KIND_LABELS } from '../data/foods';
import { formatKPrice, formatPriceRange } from '../utils/foodLogic';
import { DishImage } from './DishImage';

const MEAL_TIME_LABELS: Record<MealTime, string> = {
  sang: 'Sáng',
  trua: 'Trưa',
  toi: 'Tối',
};

interface FoodDetailSheetProps {
  food: FoodItem | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
  onConfirmFood: (food: FoodItem) => void;
}

export const FoodDetailSheet: React.FC<FoodDetailSheetProps> = ({
  food,
  isFavorite,
  onClose,
  onToggleFavorite,
  onConfirmFood,
}) => {
  useEffect(() => {
    if (!food) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [food, onClose]);

  if (!food) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-dish-name"
    >
      <div
        className="w-full max-w-md max-h-[82dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFDF8] dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] shadow-2xl pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile bottom sheet feel */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="w-10" aria-hidden="true" />
          <div className="w-10 h-1.5 rounded-full bg-[#E5D5DD] dark:bg-[#4B3A47]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết món ăn"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6E5B65] dark:text-[#CBBBC4] hover:bg-[#FFEAF0]/60 dark:hover:bg-[#3B2531]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <DishImage
            food={food}
            eager
            className="w-full aspect-[4/3] rounded-2xl border border-[#F3E8EE] dark:border-[#3B2E38]"
          />

          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#6E5B65] dark:text-[#CBBBC4]">
                  {MEAL_KIND_LABELS[food.mealKind]} · {CATEGORY_LABELS[food.category]}
                  {food.isVegetarian ? ' · Món chay' : ''}
                </p>
                <h2
                  id="detail-dish-name"
                  className="mt-1 text-xl font-bold text-[#2D2229] dark:text-[#FDF7F9] text-balance"
                >
                  {food.name}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <span className="block text-base font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                  {formatPriceRange(food.minPrice, food.maxPrice)}
                </span>
                {food.typicalPrice !== undefined && (
                  <span className="block text-[11px] font-medium tabular-nums text-[#6E5B65] dark:text-[#CBBBC4]">
                    Phổ biến ~{formatKPrice(food.typicalPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-[#4A3B43] dark:text-[#E5D7DF]">
              {food.description}
            </p>

            <p className="mt-3 text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
              Hợp ăn vào buổi:{' '}
              <span className="font-semibold text-[#2D2229] dark:text-[#FDF7F9]">
                {food.mealTypes.map((m) => MEAL_TIME_LABELS[m]).join(' · ')}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-[#8C7782] dark:text-[#B8A5B0]">
              Giá tham khảo, tùy quán và khẩu phần.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onToggleFavorite(food.id)}
                aria-label={isFavorite ? `Bỏ yêu thích ${food.name}` : `Thêm ${food.name} vào yêu thích`}
                aria-pressed={isFavorite}
                className={`min-h-[48px] px-4 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  isFavorite
                    ? 'bg-[#FFEAF0] dark:bg-[#3B2531] border-[#FFB6C1] text-[#B43456] dark:text-[#FFB6C1]'
                    : 'bg-white dark:bg-[#2E242D] border-[#E8D9E1] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#E5D7DF]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
                <span>{isFavorite ? 'Đã thích' : 'Thích'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirmFood(food);
                  onClose();
                }}
                className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:brightness-95 active:scale-[0.98] transition"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Chốt món này!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
