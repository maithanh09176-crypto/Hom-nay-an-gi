import React, { useMemo, useState } from 'react';
import { Dices, Heart } from 'lucide-react';
import type { FoodItem } from '../types/food';
import { CATEGORY_LABELS } from '../data/foods';
import { formatPriceRange, pickRandomFood } from '../utils/foodLogic';
import { DishImage } from './DishImage';

interface FavoritesViewProps {
  foods: FoodItem[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  onSelectFood: (food: FoodItem) => void;
  onGoToMenu: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  foods,
  favoriteIds,
  onToggleFavorite,
  onSelectFood,
  onGoToMenu,
}) => {
  const [pickedFavorite, setPickedFavorite] = useState<FoodItem | null>(null);
  const [recentFavIds, setRecentFavIds] = useState<number[]>([]);

  const favoriteFoods = useMemo(
    () => foods.filter((f) => favoriteIds.includes(f.id)),
    [foods, favoriteIds]
  );

  const handleRandomFavorite = () => {
    const next = pickRandomFood(favoriteFoods, recentFavIds, []);
    setPickedFavorite(next);
    if (next) {
      setRecentFavIds((prev) => [next.id, ...prev.filter((id) => id !== next.id)].slice(0, 5));
    }
  };

  return (
    <section aria-labelledby="favorites-heading" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="favorites-heading"
            className="text-xl sm:text-2xl font-bold text-[#2D2229] dark:text-[#FDF7F9]"
          >
            Món yêu thích ❤️
          </h2>
          <p className="mt-1 text-sm text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
            {favoriteFoods.length > 0
              ? `Bạn đang lưu ${favoriteFoods.length} món tủ để quay nhanh khi lười nghĩ.`
              : 'Chưa lưu món nào hết nè.'}
          </p>
        </div>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-8 text-center space-y-3">
          <img
            src="/src/assets/images/cute_noodle_mascot_1795019529832.jpg"
            alt="Minh họa tô mì pastel"
            className="w-20 h-20 rounded-2xl object-cover mx-auto border border-[#F3E8EE] dark:border-[#3B2E38]"
          />
          <p className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]">
            Danh sách yêu thích còn đang trống trơn
          </p>
          <p className="text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
            Thả tim mấy món bạn hay ăn để lúc nào phân vân thì quay thẳng trong này cho lẹ nha!
          </p>
          <button
            type="button"
            onClick={onGoToMenu}
            className="min-h-[44px] px-5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm hover:brightness-95 transition"
          >
            Khám phá 120 món ngay
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-[#FFEAF0]/65 dark:bg-[#2E212B] border border-[#F7D6E0] dark:border-[#453140] p-4 space-y-3">
            <button
              type="button"
              onClick={handleRandomFavorite}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition"
            >
              <Dices className="w-4 h-4 shrink-0" />
              <span>Quay ngẫu nhiên trong danh sách yêu thích</span>
            </button>

            {pickedFavorite && favoriteIds.includes(pickedFavorite.id) && (
              <button
                type="button"
                onClick={() => onSelectFood(pickedFavorite)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38]"
              >
                <DishImage food={pickedFavorite} eager className="w-20 h-16 rounded-xl shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-[#9C3B58] dark:text-[#FFB6C1]">
                    Món tủ vừa được chọn:
                  </p>
                  <p className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] truncate">
                    {pickedFavorite.name}
                  </p>
                  <p className="text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                    {formatPriceRange(pickedFavorite.minPrice, pickedFavorite.maxPrice)}
                  </p>
                  <p className="text-[10px] text-[#8C7782] dark:text-[#B8A5B0]">
                    Giá tham khảo, tùy quán và khẩu phần.
                  </p>
                </div>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {favoriteFoods.map((food) => (
              <article
                key={food.id}
                className="relative flex flex-col rounded-2xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => onSelectFood(food)}
                  className="text-left flex-1 flex flex-col"
                >
                  <DishImage food={food} className="w-full aspect-[4/3]" />
                  <div className="p-2.5">
                    <p className="text-[11px] text-[#6E5B65] dark:text-[#CBBBC4] truncate">
                      {CATEGORY_LABELS[food.category]}
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] line-clamp-2">
                      {food.name}
                    </h3>
                    <p className="mt-1.5 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                      {formatPriceRange(food.minPrice, food.maxPrice)}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(food.id)}
                  aria-label={`Bỏ yêu thích ${food.name}`}
                  className="absolute top-1.5 right-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/90 dark:bg-[#1E171D]/85 shadow-xs"
                >
                  <Heart className="w-4 h-4 fill-[#E11D48] text-[#E11D48]" />
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
