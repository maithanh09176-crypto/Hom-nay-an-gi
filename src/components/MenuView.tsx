import React, { useMemo, useState } from 'react';
import { Heart, Search, X } from 'lucide-react';
import type { FoodCategory, FoodItem } from '../types/food';
import { CATEGORY_LABELS } from '../data/foods';
import {
  filterByBudget,
  formatBudgetLabel,
  formatPriceRange,
  searchAndFilterMenu,
} from '../utils/foodLogic';
import { DishImage } from './DishImage';

interface MenuViewProps {
  foods: FoodItem[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  onSelectFood: (food: FoodItem) => void;
  onReshuffle: () => void;
}

const CATEGORY_ORDER: Array<{ id: FoodCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'com', label: 'Cơm' },
  { id: 'bun-pho', label: 'Bún, phở, mì' },
  { id: 'banh-xoi', label: 'Bánh & Xôi' },
  { id: 'mon-chinh-khac', label: 'Chính khác' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'ga-ran', label: 'Gà rán' },
  { id: 'hai-san', label: 'Ốc & Hải sản' },
  { id: 'do-tay', label: 'Đồ Tây' },
  { id: 'an-vat', label: 'Ăn vặt' },
  { id: 'trang-mieng', label: 'Tráng miệng' },
];

const MENU_BUDGETS: Array<{ value: number | null; label: string }> = [
  { value: 25000, label: '25k' },
  { value: 35000, label: '35k' },
  { value: 45000, label: '45k' },
  { value: 55000, label: '55k' },
  { value: 75000, label: '75k' },
  { value: 100000, label: '100k' },
  { value: null, label: 'Tất cả' },
];

const PAGE_SIZE = 16;

export const MenuView: React.FC<MenuViewProps> = ({
  foods,
  favoriteIds,
  onToggleFavorite,
  onSelectFood,
  onReshuffle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [onlyVegetarian, setOnlyVegetarian] = useState(false);
  const [menuBudget, setMenuBudget] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const budgetScopedFoods = useMemo(
    () => filterByBudget(foods, menuBudget),
    [foods, menuBudget]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: budgetScopedFoods.length };
    for (const item of budgetScopedFoods) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [budgetScopedFoods]);

  const filteredFoods = useMemo(
    () =>
      searchAndFilterMenu(
        foods,
        searchQuery,
        selectedCategory,
        onlyVegetarian,
        menuBudget
      ),
    [foods, searchQuery, selectedCategory, onlyVegetarian, menuBudget]
  );

  const isFiltering =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'all' ||
    onlyVegetarian ||
    menuBudget !== null;
  const displayedFoods = isFiltering ? filteredFoods : filteredFoods.slice(0, visibleCount);
  const remainingCount = filteredFoods.length - displayedFoods.length;

  const handleCategoryChange = (cat: FoodCategory | 'all') => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-labelledby="menu-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            id="menu-heading"
            className="text-xl sm:text-2xl font-bold text-[#2D2229] dark:text-[#FDF7F9] text-balance"
          >
            120 món ngon, hết lo không biết ăn gì 🍱
          </h2>
          <p className="mt-1 text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
            Thứ tự món được xáo trộn ngẫu nhiên để đỡ bị chán mắt nè.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onReshuffle();
            setVisibleCount(PAGE_SIZE);
          }}
          className="min-h-[44px] px-4 rounded-2xl bg-[#FFEAF0] dark:bg-[#3B2531] border border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition shrink-0"
        >
          <span>🔀 Trộn lại thực đơn</span>
        </button>
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
            placeholder="Tìm phở, bún chả, pizza, ốc, bánh tráng..."
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

      {/* Strict Budget Filter for Menu */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#4A3B43] dark:text-[#E5D7DF]">
            💸 Lọc theo ngân sách tối đa:
          </span>
          <span className="font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
            {formatBudgetLabel(menuBudget)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {MENU_BUDGETS.map((b) => {
            const active = menuBudget === b.value;
            return (
              <button
                key={b.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setMenuBudget(b.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`min-h-[44px] px-3 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors tabular-nums ${
                  active
                    ? 'bg-[#FFB6C1] border-[#F29AA8] text-[#5B2333]'
                    : 'bg-white dark:bg-[#251D24] border-[#EADCE3] dark:border-[#3B2E38] text-[#57464F] dark:text-[#D5C5CE]'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
        role="tablist"
        aria-label="Lọc theo nhóm món"
      >
        {CATEGORY_ORDER.map((tab) => {
          const active = selectedCategory === tab.id;
          const count = categoryCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleCategoryChange(tab.id)}
              className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border tabular-nums ${
                active
                  ? 'bg-[#FFEAF0] dark:bg-[#3B2531] border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2]'
                  : 'bg-white dark:bg-[#251D24] border-[#EADCE3] dark:border-[#3B2E38] text-[#6E5B65] dark:text-[#CBBBC4] hover:border-[#FFB6C1]/60'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Result Count & Helper */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
        <p className="font-medium tabular-nums">
          🍜 Có {filteredFoods.length} món phù hợp{menuBudget !== null ? ' với ngân sách của bạn' : ''} (đang hiện {displayedFoods.length})
        </p>
        <p className="text-[11px] text-[#8C7782] dark:text-[#B8A5B0]">
          Giá tham khảo, tùy quán và khẩu phần.
        </p>
      </div>

      {/* Empty State */}
      {filteredFoods.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-8 text-center space-y-3">
          <p className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]">
            {menuBudget !== null
              ? 'Ví tiền hơi thử thách rồi 😆 Thử tăng ngân sách một chút xem sao!'
              : 'Hic, không tìm thấy món nào khớp rồi 🥺'}
          </p>
          <p className="text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
            Thử đổi từ khóa, nâng mức ngân sách hoặc bỏ bớt bộ lọc nhé!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {menuBudget !== null && menuBudget < 55000 && (
              <button
                type="button"
                onClick={() => setMenuBudget(55000)}
                className="min-h-[44px] px-4 rounded-2xl bg-[#FFEAF0] dark:bg-[#3B2531] border border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2] font-bold text-sm"
              >
                Tăng ngân sách lên 55k
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyVegetarian(false);
                setMenuBudget(null);
              }}
              className="min-h-[44px] px-5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm"
            >
              Xem lại toàn bộ 120 món
            </button>
          </div>
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
