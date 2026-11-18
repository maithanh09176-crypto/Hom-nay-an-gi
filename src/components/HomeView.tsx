import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import type {
  ComboResult,
  FoodItem,
  FoodMode,
  MealTimeFilter,
  MoodId,
} from '../types/food';
import { CATEGORY_LABELS, GROUP_LABELS } from '../data/foods';
import {
  MOOD_OPTIONS,
  filterFoods,
  formatBudgetLabel,
  formatKPrice,
  formatPriceRange,
  pickRandomCombo,
  pickRandomFood,
} from '../utils/foodLogic';
import { DishImage } from './DishImage';
import { PastelConfetti } from './PastelConfetti';

interface HomeViewProps {
  foods: FoodItem[];
  favoriteIds: number[];
  reducedMotion: boolean;
  onToggleFavorite: (id: number) => void;
  onConfirmFood: (food: FoodItem) => void;
  onSelectFood: (food: FoodItem) => void;
}

const MODE_OPTIONS: Array<{ id: FoodMode; emoji: string; label: string }> = [
  { id: 'main', emoji: '🍜', label: 'Ăn chính' },
  { id: 'snack', emoji: '🍟', label: 'Ăn vặt' },
  { id: 'dessert', emoji: '🍧', label: 'Tráng miệng' },
  { id: 'all', emoji: '🎲', label: 'Tất cả' },
];

const QUICK_BUDGETS: Array<{ value: number | null; label: string }> = [
  { value: 25000, label: '25k' },
  { value: 35000, label: '35k' },
  { value: 45000, label: '45k' },
  { value: 55000, label: '55k' },
  { value: null, label: 'Không giới hạn' },
];

const MEAL_TIME_OPTIONS: Array<{ id: MealTimeFilter; label: string }> = [
  { id: 'any', label: 'Bất kỳ' },
  { id: 'sang', label: 'Sáng' },
  { id: 'trua', label: 'Trưa' },
  { id: 'toi', label: 'Tối' },
];

const COMBO_BUDGETS: Array<{ value: number | null; label: string }> = [
  { value: 50000, label: '50k' },
  { value: 65000, label: '65k' },
  { value: 80000, label: '80k' },
  { value: 100000, label: '100k' },
  { value: null, label: 'Không giới hạn' },
];

const SUBTLE_GREETINGS = [
  'Này, hôm nay ăn gì chưa?',
  'Không biết ăn gì thì cứ để web chọn hộ.',
  'Ăn gì cũng được, đừng bỏ bữa là được.',
  'Hôm nay ăn ngon một chút nha!',
];

const FEATURED_IDS = [11, 16, 20, 40, 76, 91];

export const HomeView: React.FC<HomeViewProps> = ({
  foods,
  favoriteIds,
  reducedMotion,
  onToggleFavorite,
  onConfirmFood,
  onSelectFood,
}) => {
  const [mode, setMode] = useState<FoodMode>('main');
  const [maxBudget, setMaxBudget] = useState<number | null>(40000);
  const [mealTime, setMealTime] = useState<MealTimeFilter>('any');
  const [mood, setMood] = useState<MoodId>('random-any');

  const [isRolling, setIsRolling] = useState(false);
  const [previewFood, setPreviewFood] = useState<FoodItem | null>(null);
  const [selectedResult, setSelectedResult] = useState<FoodItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [rerollCount, setRerollCount] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);

  const [comboBudget, setComboBudget] = useState<number | null>(80000);
  const [comboResult, setComboResult] = useState<ComboResult | null>(() =>
    pickRandomCombo(foods, 80000)
  );
  const [comboConfirmed, setComboConfirmed] = useState(false);

  const [greetingIndex] = useState(() => new Date().getHours() % SUBTLE_GREETINGS.length);
  const rollIntervalRef = useRef<number | null>(null);
  const rollTimeoutRef = useRef<number | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const eligiblePool = useMemo(
    () => filterFoods(foods, { mode, maxBudget, mealTime, mood }),
    [foods, mode, maxBudget, mealTime, mood]
  );

  const featuredFoods = useMemo(
    () => foods.filter((f) => FEATURED_IDS.includes(f.id)),
    [foods]
  );

  const selectedMoodObj = useMemo(
    () => MOOD_OPTIONS.find((m) => m.id === mood),
    [mood]
  );

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) window.clearInterval(rollIntervalRef.current);
      if (rollTimeoutRef.current) window.clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  const clearTimers = () => {
    if (rollIntervalRef.current) {
      window.clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    if (rollTimeoutRef.current) {
      window.clearTimeout(rollTimeoutRef.current);
      rollTimeoutRef.current = null;
    }
  };

  const runRandomizer = (isReroll = false) => {
    if (eligiblePool.length === 0 || isRolling) return;
    clearTimers();

    setIsRolling(true);
    setIsLockedIn(false);

    if (isReroll) {
      setRerollCount((prev) => prev + 1);
      setStatusMessage('Khó tính ghê, để chọn món khác vậy 😆');
    } else {
      setRerollCount(0);
      setStatusMessage('Đang nhờ vũ trụ chọn giúp một món thật hợp...');
    }

    const lastId = selectedResult?.id ?? null;
    const duration = reducedMotion ? 220 : 1950;

    if (!reducedMotion && eligiblePool.length > 1) {
      let tick = 0;
      setPreviewFood(eligiblePool[0]);
      rollIntervalRef.current = window.setInterval(() => {
        tick += 1;
        const candidate = eligiblePool[tick % eligiblePool.length];
        setPreviewFood(candidate);
      }, 110);
    }

    rollTimeoutRef.current = window.setTimeout(() => {
      clearTimers();
      const chosen = pickRandomFood(eligiblePool, lastId, mood);
      setPreviewFood(null);
      setSelectedResult(chosen);
      setIsRolling(false);
      if (chosen) {
        setConfettiKey((k) => k + 1);
        if (isReroll && rerollCount + 1 >= 3) {
          setStatusMessage('Random mãi chưa chốt thì hơi khó chiều rồi đó 😏');
        } else {
          setStatusMessage('Vũ trụ đã quyết định, giờ chỉ việc đi ăn thôi 😋');
        }
        window.requestAnimationFrame(() => {
          resultCardRef.current?.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'center',
          });
        });
      }
    }, duration);
  };

  const handleConfirmChoice = () => {
    if (!selectedResult) return;
    onConfirmFood(selectedResult);
    setIsLockedIn(true);
    setRerollCount(0);
    setStatusMessage('Xong! Giờ nhớ đi ăn thật đấy nha.');
  };

  const handleRollCombo = (budgetOverride?: number | null) => {
    const activeBudget = budgetOverride !== undefined ? budgetOverride : comboBudget;
    const lastPair: [number, number] | null = comboResult
      ? [comboResult.main.id, comboResult.dessert.id]
      : null;
    const next = pickRandomCombo(foods, activeBudget, lastPair);
    setComboResult(next);
    setComboConfirmed(false);
  };

  const handleConfirmCombo = () => {
    if (!comboResult) return;
    onConfirmFood(comboResult.main);
    onConfirmFood(comboResult.dessert);
    setComboConfirmed(true);
  };

  const handleResetFilters = () => {
    setMode('main');
    setMaxBudget(55000);
    setMealTime('any');
    setMood('random-any');
  };

  const displayedCardFood = isRolling ? previewFood ?? selectedResult : selectedResult;

  return (
    <div className="space-y-6">
      {/* 1. Tiêu đề và lời chào */}
      <section className="rounded-3xl bg-[#FFEAF0]/75 dark:bg-[#2E212B] border border-[#F7D6E0] dark:border-[#453140] p-4 sm:p-6">
        <div className="flex items-center gap-3.5">
          <img
            src="/src/assets/images/cute_noodle_mascot_1795019529832.jpg"
            alt="Minh họa tô mì pastel dễ thương"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white dark:border-[#3B2E38] shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#9C3B58] dark:text-[#FFB6C1]">
              {SUBTLE_GREETINGS[greetingIndex]}
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-[#2D2229] dark:text-[#FDF7F9] text-balance">
              Nay ăn gì nhỉ? 🍜
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#57464F] dark:text-[#DFCFD7] leading-snug">
              Câu hỏi khó nhất mỗi ngày đã có người giải quyết hộ rồi đây!
            </p>
          </div>
        </div>
      </section>

      {/* Main Split on Desktop, Single Thumb Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-5">
          {/* 2. Chọn loại món */}
          <section aria-labelledby="mode-section-title" className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="mode-section-title"
                className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9]"
              >
                Chọn loại món
              </h2>
              <span className="text-xs text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
                {eligiblePool.length} món hợp điều kiện
              </span>
            </div>

            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
              role="tablist"
              aria-label="Chế độ chọn món"
            >
              {MODE_OPTIONS.map((opt) => {
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMode(opt.id)}
                    className={`min-h-[44px] px-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 border transition-colors ${
                      active
                        ? 'bg-[#FFB6C1] border-[#F29AA8] text-[#5B2333] shadow-xs'
                        : 'bg-white dark:bg-[#251D24] border-[#EADCE3] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#E5D7DF] hover:border-[#FFB6C1]'
                    }`}
                  >
                    <span aria-hidden="true">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Bộ lọc ngân sách nhanh + Thời điểm */}
          <section
            aria-labelledby="budget-section-title"
            className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="budget-section-title"
                className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9]"
              >
                Ngân sách tối đa
              </h2>
              <span className="text-sm font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                {formatBudgetLabel(maxBudget)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_BUDGETS.map((b) => {
                const active = maxBudget === b.value;
                return (
                  <button
                    key={b.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMaxBudget(b.value)}
                    className={`min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-colors tabular-nums ${
                      active
                        ? 'bg-[#FFEAF0] dark:bg-[#3B2531] border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2]'
                        : 'bg-[#FFFDF8] dark:bg-[#1E171D] border-[#EADCE3] dark:border-[#3B2E38] text-[#57464F] dark:text-[#D5C5CE]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="budget-slider" className="sr-only">
                Thanh trượt chọn ngân sách tối đa
              </label>
              <input
                id="budget-slider"
                type="range"
                min={15000}
                max={70000}
                step={5000}
                value={maxBudget ?? 70000}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #FFB6C1 ${
                    (((maxBudget ?? 70000) - 15000) / 55000) * 100
                  }%, #F3E8EE ${(((maxBudget ?? 70000) - 15000) / 55000) * 100}%)`,
                }}
                className="w-full pastel-slider"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
                <span>15k</span>
                <span>40k</span>
                <span>70k</span>
              </div>
            </div>

            {/* Khung giờ */}
            <div className="pt-2 border-t border-[#F5EBF0] dark:border-[#3B2E38]">
              <p className="text-xs font-bold text-[#2D2229] dark:text-[#FDF7F9] mb-2">
                Ăn vào buổi nào?
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {MEAL_TIME_OPTIONS.map((t) => {
                  const active = mealTime === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMealTime(t.id)}
                      className={`min-h-[44px] rounded-xl text-xs font-semibold transition-colors border ${
                        active
                          ? 'bg-[#C5E8D5] dark:bg-[#1E332B] border-[#82C09A] text-[#1D4B30] dark:text-[#A9E4C1]'
                          : 'bg-[#FFFDF8] dark:bg-[#1E171D] border-[#EADCE3] dark:border-[#3B2E38] text-[#57464F] dark:text-[#D5C5CE]'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. Khu vực Random + 5. Kết quả + 6. Chốt / Quay lại */}
          <section
            aria-labelledby="randomizer-heading"
            className="relative rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-4 sm:p-5 shadow-xs overflow-hidden"
          >
            <PastelConfetti burstKey={confettiKey} reducedMotion={reducedMotion} />

            <h2 id="randomizer-heading" className="sr-only">
              Khu vực quay món ngẫu nhiên
            </h2>

            {eligiblePool.length === 0 ? (
              <div className="py-5 text-center space-y-3">
                <p className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]">
                  Chưa tìm thấy món nào trong tầm giá này rồi 🥺
                </p>
                <p className="text-xs sm:text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
                  Thử nới ngân sách lên một chút hoặc chuyển buổi ăn về &ldquo;Bất kỳ&rdquo; nha!
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-[44px] px-5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm hover:brightness-95 transition"
                >
                  Đặt lại bộ lọc (55k · Bất kỳ)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => runRandomizer(false)}
                  disabled={isRolling}
                  className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-base shadow-sm hover:brightness-95 active:scale-[0.98] disabled:opacity-75 transition flex items-center justify-center gap-2"
                >
                  <span aria-hidden="true">🎲</span>
                  <span>
                    {isRolling ? 'Đang hỏi ý kiến vũ trụ...' : 'QUAY MÓN NGẪU NHIÊN'}
                  </span>
                </button>

                {displayedCardFood ? (
                  <div ref={resultCardRef} className="space-y-3.5 pt-1" aria-live="polite">
                    {statusMessage && (
                      <p className="text-center text-xs sm:text-sm font-semibold text-[#9C3B58] dark:text-[#FFB6C1]">
                        {statusMessage}
                      </p>
                    )}

                    <div className="relative rounded-2xl border border-[#F3E8EE] dark:border-[#3B2E38] bg-[#FFFDF8] dark:bg-[#1E171D] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => !isRolling && onSelectFood(displayedCardFood)}
                        aria-label={`Xem chi tiết ${displayedCardFood.name}`}
                        className="w-full text-left block focus-visible:outline-2 focus-visible:outline-[#E11D48]"
                      >
                        <DishImage
                          food={displayedCardFood}
                          eager
                          className={`w-full aspect-[4/3] ${isRolling ? 'opacity-85' : ''}`}
                        />
                      </button>

                      {!isRolling && (
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(displayedCardFood.id)}
                          aria-label={
                            favoriteIds.includes(displayedCardFood.id)
                              ? `Bỏ yêu thích ${displayedCardFood.name}`
                              : `Yêu thích ${displayedCardFood.name}`
                          }
                          aria-pressed={favoriteIds.includes(displayedCardFood.id)}
                          className="absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/90 dark:bg-[#251D24]/90 backdrop-blur-xs shadow-sm"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favoriteIds.includes(displayedCardFood.id)
                                ? 'fill-[#E11D48] text-[#E11D48]'
                                : 'text-[#6E5B65] dark:text-[#E5D7DF]'
                            }`}
                          />
                        </button>
                      )}

                      <div className="p-3.5 sm:p-4">
                        <p className="text-xs font-medium text-[#6E5B65] dark:text-[#CBBBC4]">
                          {GROUP_LABELS[displayedCardFood.group]} ·{' '}
                          {CATEGORY_LABELS[displayedCardFood.category]}
                          {displayedCardFood.isVegetarian ? ' · Món chay' : ''}
                        </p>
                        <div className="mt-1 flex items-baseline justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-[#2D2229] dark:text-[#FDF7F9]">
                            {displayedCardFood.name}
                          </h3>
                          <span className="shrink-0 text-sm sm:text-base font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                            {formatPriceRange(
                              displayedCardFood.minPrice,
                              displayedCardFood.maxPrice
                            )}
                          </span>
                        </div>
                        {!isRolling && (
                          <p className="mt-1.5 text-xs sm:text-sm text-[#57464F] dark:text-[#D5C5CE] leading-relaxed">
                            {displayedCardFood.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isRolling && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={handleConfirmChoice}
                          className={`min-h-[48px] px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] ${
                            isLockedIn
                              ? 'bg-[#C5E8D5] dark:bg-[#1E332B] text-[#1D4B30] dark:text-[#A9E4C1]'
                              : 'bg-[#DCC6F0] dark:bg-[#3A2B4C] text-[#35224A] dark:text-[#EDE2FA] hover:brightness-95'
                          }`}
                        >
                          <span>{isLockedIn ? '✅ Đã chốt món này!' : '✅ Chốt món này!'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => runRandomizer(true)}
                          className="min-h-[48px] px-4 rounded-2xl bg-[#FFFDF8] dark:bg-[#1E171D] border border-[#EADCE3] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#E5D7DF] font-bold text-sm flex items-center justify-center gap-1.5 hover:border-[#FFB6C1] active:scale-[0.98] transition"
                        >
                          <span>🔄 Không ưng, quay tiếp!</span>
                        </button>
                      </div>
                    )}

                    {isLockedIn && (
                      <p className="text-center text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
                        Ăn xong nhớ đánh giá cho người làm web nha.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
                    Đói rồi mà còn phân vân nữa à 😆 Bấm nút hồng phía trên để chọn liền nha!
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right column on Desktop / Continuing flow on Mobile */}
        <div className="lg:col-span-5 space-y-5">
          {/* Chọn theo tâm trạng */}
          <section
            aria-labelledby="mood-heading"
            className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-4 space-y-3"
          >
            <div>
              <h2
                id="mood-heading"
                className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9]"
              >
                Hôm nay tâm trạng thế nào?
              </h2>
              {selectedMoodObj && (
                <p className="mt-0.5 text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
                  {selectedMoodObj.hint}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOOD_OPTIONS.map((item) => {
                const active = mood === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setMood(item.id);
                      if (item.id === 'sweet-tooth' && mode === 'main') {
                        // Gently leave mode intact so budget/category rules remain pure,
                        // unless user chooses Tất cả or Tráng miệng themselves.
                      }
                    }}
                    className={`min-h-[46px] px-3 py-2 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-colors ${
                      active
                        ? 'bg-[#EDE3F8] dark:bg-[#3A2B4C] border-[#BFA0E2] text-[#35224A] dark:text-[#EDE2FA]'
                        : 'bg-[#FFFDF8] dark:bg-[#1E171D] border-[#EADCE3] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#E5D7DF] hover:border-[#DCC6F0]'
                    }`}
                  >
                    <span className="text-base shrink-0" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="leading-tight line-clamp-2">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 7. Gợi ý combo */}
          <section
            aria-labelledby="combo-heading"
            className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-4 space-y-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2
                  id="combo-heading"
                  className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9]"
                >
                  🍜 Một món chính + một món tráng miệng
                </h2>
                <p className="mt-0.5 text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
                  Ghép đôi vừa no vừa mát miệng trong đúng ngân sách combo.
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                {comboBudget === null ? 'Không giới hạn' : `≤ ${formatKPrice(comboBudget)}`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COMBO_BUDGETS.map((cb) => {
                const active = comboBudget === cb.value;
                return (
                  <button
                    key={cb.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setComboBudget(cb.value);
                      handleRollCombo(cb.value);
                    }}
                    className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border transition-colors tabular-nums ${
                      active
                        ? 'bg-[#FFEAF0] dark:bg-[#3B2531] border-[#FFB6C1] text-[#5B2333] dark:text-[#FFD6E2]'
                        : 'bg-[#FFFDF8] dark:bg-[#1E171D] border-[#EADCE3] dark:border-[#3B2E38] text-[#57464F] dark:text-[#D5C5CE]'
                    }`}
                  >
                    {cb.label}
                  </button>
                );
              })}
            </div>

            {comboResult ? (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  {[comboResult.main, comboResult.dessert].map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      type="button"
                      onClick={() => onSelectFood(item)}
                      className="text-left rounded-2xl bg-[#FFFDF8] dark:bg-[#1E171D] border border-[#F3E8EE] dark:border-[#3B2E38] overflow-hidden hover:border-[#FFB6C1] transition"
                    >
                      <DishImage food={item} className="w-full aspect-[4/3]" />
                      <div className="p-2.5">
                        <p className="text-[11px] text-[#6E5B65] dark:text-[#CBBBC4]">
                          {idx === 0 ? 'Món chính' : 'Tráng miệng'}
                        </p>
                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] line-clamp-1">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                          {formatPriceRange(item.minPrice, item.maxPrice)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                  <span className="text-[#57464F] dark:text-[#D5C5CE]">
                    Tổng ước tính:{' '}
                    <strong className="text-[#2D2229] dark:text-[#FDF7F9] tabular-nums">
                      {formatPriceRange(comboResult.minTotal, comboResult.maxTotal)}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRollCombo()}
                    className="min-h-[44px] px-3 rounded-2xl bg-[#FFEAF0] dark:bg-[#3B2531] text-[#5B2333] dark:text-[#FFD6E2] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Quay combo khác</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCombo}
                    className={`min-h-[44px] px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
                      comboConfirmed
                        ? 'bg-[#C5E8D5] dark:bg-[#1E332B] text-[#1D4B30] dark:text-[#A9E4C1]'
                        : 'bg-[#DCC6F0] dark:bg-[#3A2B4C] text-[#35224A] dark:text-[#EDE2FA]'
                    }`}
                  >
                    <span>{comboConfirmed ? '✅ Đã chốt combo!' : '✅ Chốt combo'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#1E171D] p-4 text-center">
                <p className="text-xs sm:text-sm font-semibold text-[#57464F] dark:text-[#D5C5CE]">
                  Ngân sách combo này hơi thấp để ghép 1 món chính + 1 tráng miệng rồi nè. Thử chọn từ 50k trở lên nha!
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 8. Các món nổi bật */}
      <section aria-labelledby="featured-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="featured-heading"
            className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]"
          >
            Các món nổi bật dễ chốt
          </h2>
          <span className="text-xs text-[#6E5B65] dark:text-[#CBBBC4]">
            Gợi ý nhanh · Chạm để xem
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {featuredFoods.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => onSelectFood(food)}
              className="text-left rounded-2xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] overflow-hidden hover:border-[#FFB6C1] transition shadow-xs"
            >
              <DishImage food={food} className="w-full aspect-[4/3]" />
              <div className="p-2.5">
                <p className="text-xs sm:text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] line-clamp-1">
                  {food.name}
                </p>
                <p className="mt-0.5 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                  {formatPriceRange(food.minPrice, food.maxPrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ending message + quiet subtle P/s */}
      <footer className="pt-2 pb-4 text-center space-y-1.5">
        <p className="text-sm font-semibold text-[#57464F] dark:text-[#DFCFD7]">
          Ăn gì cũng được, miễn hôm nay có một bữa thật ngon! 🍜
        </p>
        <p className="text-[11px] text-[#8C7782] dark:text-[#9E8B96]">
          P/s: Nếu vẫn chưa chọn được món thì rủ người làm web này đi ăn cũng được 😌
        </p>
      </footer>
    </div>
  );
};
