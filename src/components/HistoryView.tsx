import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { FoodItem, HistoryEntry } from '../types/food';
import { CATEGORY_LABELS } from '../data/foods';
import { formatPriceRange } from '../utils/foodLogic';
import { DishImage } from './DishImage';

interface HistoryViewProps {
  foods: FoodItem[];
  history: HistoryEntry[];
  onClearHistory: () => void;
  onRemoveEntry: (uid: string) => void;
  onSelectFood: (food: FoodItem) => void;
  onGoHome: () => void;
}

function formatVietnameseTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  foods,
  history,
  onClearHistory,
  onRemoveEntry,
  onSelectFood,
  onGoHome,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <section aria-labelledby="history-heading" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="history-heading"
            className="text-xl sm:text-2xl font-bold text-[#2D2229] dark:text-[#FDF7F9]"
          >
            Nhật ký đã ăn 🕒
          </h2>
          <p className="mt-1 text-sm text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
            {history.length > 0
              ? `Đã chốt ${history.length} bữa ăn ngon lành rồi đó!`
              : 'Chỉ lưu khi bạn bấm “Chốt món này!” thôi nha.'}
          </p>
        </div>

        {history.length > 0 && (
          <div className="shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-[#E11D48] text-white text-xs font-bold"
                >
                  Chắc chắn xóa
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-[#251D24] border border-[#EADCE3] dark:border-[#3B2E38] text-xs font-semibold text-[#57464F] dark:text-[#D5C5CE]"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[44px] px-3 rounded-xl border border-[#EADCE3] dark:border-[#3B2E38] bg-white dark:bg-[#251D24] text-xs font-semibold text-[#6E5B65] dark:text-[#CBBBC4] hover:text-[#E11D48] flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-8 text-center space-y-3">
          <img
            src="/src/assets/images/cute_noodle_mascot_1795019529832.jpg"
            alt="Minh họa tô mì pastel"
            className="w-20 h-20 rounded-2xl object-cover mx-auto border border-[#F3E8EE] dark:border-[#3B2E38]"
          />
          <p className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]">
            Chưa có món nào được chốt hôm nay
          </p>
          <p className="text-sm text-[#6E5B65] dark:text-[#CBBBC4]">
            Quay thử một món ở Trang chủ rồi bấm &ldquo;Chốt món này!&rdquo; để lưu lại kỷ niệm bữa ăn nha.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[44px] px-5 rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm hover:brightness-95 transition"
          >
            Về Trang chủ quay món
          </button>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {history.map((entry) => {
            const matchedFood = foods.find((f) => f.id === entry.foodId);
            return (
              <li
                key={entry.uid}
                className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-2.5 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => matchedFood && onSelectFood(matchedFood)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left"
                >
                  {matchedFood && (
                    <DishImage food={matchedFood} className="w-16 h-14 rounded-xl shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#2D2229] dark:text-[#FDF7F9] truncate">
                      {entry.foodName}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6E5B65] dark:text-[#CBBBC4] tabular-nums">
                      {CATEGORY_LABELS[entry.category]} · {formatVietnameseTime(entry.chosenAt)}
                    </p>
                    <p className="mt-0.5 text-xs font-bold tabular-nums text-[#B43456] dark:text-[#FFB6C1]">
                      {formatPriceRange(entry.minPrice, entry.maxPrice)}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveEntry(entry.uid)}
                  aria-label={`Xóa ${entry.foodName} khỏi lịch sử`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#8C7782] dark:text-[#B8A5B0] hover:text-[#E11D48] hover:bg-[#FFEAF0]/50 dark:hover:bg-[#3B2531]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
