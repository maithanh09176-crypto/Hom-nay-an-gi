import { useEffect, useState } from 'react';
import { Moon, Sun, WifiOff } from 'lucide-react';
import { FOODS } from './data/foods';
import type { FoodItem, HistoryEntry } from './types/food';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { BottomNav, type AppTab } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { MenuView } from './components/MenuView';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { FoodDetailSheet } from './components/FoodDetailSheet';
import { PWAInstallButton } from './components/PWAInstallButton';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<number[]>('nayan_favorites', []);
  const [history, setHistory] = useLocalStorageState<HistoryEntry[]>('nayan_history', []);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [detailFood, setDetailFood] = useState<FoodItem | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('nayan_theme', theme);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  useEffect(() => {
    if (!toastText) return;
    const timer = window.setTimeout(() => setToastText(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastText]);

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [id, ...prev];
      const food = FOODS.find((f) => f.id === id);
      if (food) {
        setToastText(
          exists ? `Đã bỏ ${food.name} khỏi yêu thích` : `Đã lưu ${food.name} vào yêu thích ❤️`
        );
      }
      return next;
    });
  };

  const handleConfirmFood = (food: FoodItem) => {
    const entry: HistoryEntry = {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodId: food.id,
      foodName: food.name,
      minPrice: food.minPrice,
      maxPrice: food.maxPrice,
      category: food.category,
      chosenAt: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 60));
    setToastText(`Đã chốt ${food.name}! Giờ nhớ đi ăn thật đấy nha.`);
  };

  const handleRemoveHistoryEntry = (uid: string) => {
    setHistory((prev) => prev.filter((item) => item.uid !== uid));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setToastText('Đã dọn sạch lịch sử ăn uống!');
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-[#FFFDF8] dark:bg-[#1A1419] text-[#2D2229] dark:text-[#FDF7F9] transition-colors">
      {/* Compact static top bar (keeps fixed sticky chrome < 10% of mobile viewport) */}
      <header className="max-w-5xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => handleTabChange('home')}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-[#2D2229] dark:text-[#FDF7F9] whitespace-nowrap shrink-0 min-h-[44px] flex items-center gap-1.5"
        >
          <span aria-hidden="true">🍜</span>
          <span>Nay ăn gì nhỉ?</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Bật chế độ tối' : 'Bật chế độ sáng'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white dark:bg-[#251D24] border border-[#EADCE3] dark:border-[#3B2E38] text-[#4A3B43] dark:text-[#FFD6E2] hover:border-[#FFB6C1] transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {!isOnline && (
        <div
          role="status"
          className="max-w-5xl mx-auto px-4 mb-2"
        >
          <div className="rounded-2xl bg-[#FFF4D6] dark:bg-[#3A2F1C] border border-[#F2D06B]/60 px-3.5 py-2 text-xs font-semibold text-[#6E4F12] dark:text-[#FCE39D] flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Đang offline — Dữ liệu 100 món và lịch sử vẫn dùng bình thường nha!</span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 pt-2 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {activeTab === 'home' && (
          <HomeView
            foods={FOODS}
            favoriteIds={favoriteIds}
            reducedMotion={reducedMotion}
            onToggleFavorite={handleToggleFavorite}
            onConfirmFood={handleConfirmFood}
            onSelectFood={setDetailFood}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            foods={FOODS}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectFood={setDetailFood}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            foods={FOODS}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectFood={setDetailFood}
            onGoToMenu={() => handleTabChange('menu')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            foods={FOODS}
            history={history}
            onClearHistory={handleClearHistory}
            onRemoveEntry={handleRemoveHistoryEntry}
            onSelectFood={setDetailFood}
            onGoHome={() => handleTabChange('home')}
          />
        )}
      </main>

      {/* Subtle transient confirmation toast above bottom nav */}
      {toastText && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] inset-x-4 z-40 flex justify-center pointer-events-none"
        >
          <div className="max-w-sm rounded-2xl bg-[#2D2229] dark:bg-[#FFEAF0] text-[#FFFDF8] dark:text-[#5B2333] px-4 py-2.5 text-xs font-semibold shadow-lg">
            {toastText}
          </div>
        </div>
      )}

      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        favoritesCount={favoriteIds.length}
        historyCount={history.length}
      />

      <FoodDetailSheet
        food={detailFood}
        isFavorite={detailFood ? favoriteIds.includes(detailFood.id) : false}
        onClose={() => setDetailFood(null)}
        onToggleFavorite={handleToggleFavorite}
        onConfirmFood={handleConfirmFood}
      />
    </div>
  );
}
