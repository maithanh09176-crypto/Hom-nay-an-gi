import React, { useMemo, useState } from 'react';
import { Heart, Search, X } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../types/food';
import { CATEGORY_LABELS } from '../data/foods';
import { formatPriceRange, searchAndFilterMenu } from '../utils/foodLogic';
import { DishImage } from './DishImage';

interface MenuViewProps {
  foods: FoodItem[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  onSelectFood: (food: FoodItem) => void;
}

const CATEGORY_TABS: Array<{ id: FoodCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Tất cả (100)' },
  { id: 'com', label: 'Cơm (10)' },
  { id: 'bun-pho', label: 'Bún & Phở (28)' },
  { id: 'banh-xoi', label: 'Bánh & Xôi (20)' },
  { id: 'mon-chinh-khac', label: 'Chính khác (14)' },
  { id: 'an-vat', label: 'Ăn vặt (16)' },
  { id: 'trang-mieng', label: 'Tráng miệng (12)' },
];

const PAGE_SIZE = 16;

export const MenuView: React.FC<MenuViewProps> = ({
  foods,
  favoriteIds,
  onToggleFavorite,
  onSelectFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [onlyVegetarian, setOnlyVegetarian] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredFoods = useMemo(
    () => searchAndFilterMenu(foods, searchQuery, selectedCategory, onlyVegetarian),
    [foods, searchQuery, selectedCategory, onlyVegetarian]
  );

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'all' || onlyVegetarian;
  const displayedFoods = isFiltering ? filteredFoods : filteredFoods.slice(0, visibleCount);
  const remainingCount = filteredFoods.length - displayedFoods.length;

  const handleCategoryChange = (cat: FoodCategory | 'all') => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-labelledby="menu-heading" className="space-y-4">
      <div>
        <h2
          id="menu-heading"
          className="text-xl sm:text-2xl font-bold text-[#2D2229] dark:text-[#FDF7F9] text-balance"
        >
          100 món ngon, hết lo không biết ăn gì 🍱
        </h2>
        <p className="mt-1 text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
          Chạm vào từng món để xem chi tiết, hoặc thả tim lưu lại món tủ của bạn.
        </p>
      </div>

      {/* Search & Vegetarian Toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <label htmlFor="menu-search" className="sr-only">
            Tìm kiếm món ăn theo tên
          </label>
          <Search
            className="w-4 h-4 text-[#8C7782] dark:text-[#B8A5B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="menu-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm phở, bún chả, bánh mì, chè..."
            className="w-full min-h-[44px] pl-10 pr-10 rounded-2xl bg-white dark:bg-[#251D24] border border-[#EADCE3] dark:border-[#3B2E38] text-sm text-[#2D2229] dark:text-[#FDF7F9] placeholder:text-[#9C8893] focus:outline-none focus:border-[#FFB6C1]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#6E5B65] dark:text-[#CBBBC4]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOnlyVegetarian((v) => !v)}
          aria-pressed={onlyVegetarian}
          className={`min-h-[44px] px-4 rounded-2xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            onlyVegetarian
              ? 'bg-[#C5E8D5] dark:bg-[#1E332B] border-[#82C09A] text-[#1D4B30] dark:text-[#A9E4C1]'
              : 'bg-white dark:bg-[#251D24] border-[#EADCE3] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#E5D7DF]'
          }`}
        >
          🥬 Chỉ món chay
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
        role="tablist"
        aria-label="Lọc theo nhóm món"
      >
        {CATEGORY_TABS.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleCategoryChange(tab.id)}
              className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                active
                  ? 'bg-[#FFEAF0] dark:bg-[#3B2531] border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2]'
                  : 'bg-white dark:bg-[#251D24] border-[#EADCE3] dark:border-[#3B2E38] text-[#6E5B65] dark:text-[#CBBBC4] hover:border-[#FFB6C1]/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Result Count */}
      <p className="text-xs font-medium text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
        Đang hiển thị {displayedFoods.length} / {filteredFoods.length} món phù hợp
      </p>

      {/* Empty State */}
      {filteredFoods.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-8 text-center">
          <p className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]">
            Hic, không tìm thấy món nào khớp rồi 🥺
          </p>
          <p className="mt-1 text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
            Thử đổi từ khóa khác hoặc bỏ bộ lọc xem sao nhé!
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyVegetarian(false);
            }}
            className="mt-4 min-h-[44px] px-5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm"
          >
            Xem lại toàn bộ 100 món
          </button>
        </div>
      ) : (
        <>
          {/* 2-col mobile grid, 3-col tablet, 4-col desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedFoods.map((food) => {
              const isFav = favoriteIds.includes(food.id);
              return (
                <article
                  key={food.id}
                  className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => onSelectFood(food)}
                    aria-label={`Xem chi tiết ${food.name}`}
                    className="text-left flex-1 flex flex-col focus-visible:outline-2 focus-visible:outline-[#E11D48]"
                  >
                    <DishImage food={food} className="w-full aspect-[4/3]" />
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] text-[#6E5B65] dark:text-[#CBBBC4] truncate">
                          {CATEGORY_LABELS[food.category]}
                        </p>
                        <h3 className="mt-0.5 text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] line-clamp-2 leading-snug">
                          {food.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                        {formatPriceRange(food.minPrice, food.maxPrice)}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(food.id)}
                    aria-label={isFav ? `Bỏ yêu thích ${food.name}` : `Yêu thích ${food.name}`}
                    aria-pressed={isFav}
                    className="absolute top-1.5 right-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/88 dark:bg-[#1E171D]/85 backdrop-blur-xs shadow-xs active:scale-95 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav
                          ? 'fill-[#E11D48] text-[#E11D48]'
                          : 'text-[#6E5B65] dark:text-[#E5D7DF]'
                      }`}
                    />
                  </button>
                </article>
              );
            })}
          </div>

          {remainingCount > 0 && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="min-h-[48px] px-6 rounded-2xl bg-[#FFEAF0] dark:bg-[#3B2531] text-[#5B2333] dark:text-[#FFD6E2] font-bold text-sm hover:bg-[#FFB6C1]/45 transition-colors tabular-nums"
              >
                Xem thêm món (còn {remainingCount} món)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
