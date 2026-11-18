import React from 'react';
import { Clock, Heart, Home, UtensilsCrossed } from 'lucide-react';

export type AppTab = 'home' | 'menu' | 'favorites' | 'history';

interface BottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  favoritesCount: number;
  historyCount: number;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  emoji: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Trang chủ', emoji: '🏠', Icon: Home },
  { id: 'menu', label: 'Thực đơn', emoji: '🍱', Icon: UtensilsCrossed },
  { id: 'favorites', label: 'Yêu thích', emoji: '❤️', Icon: Heart },
  { id: 'history', label: 'Đã ăn', emoji: '🕒', Icon: Clock },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount,
  historyCount,
}) => {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF8]/92 dark:bg-[#1E171D]/92 backdrop-blur-md border-t border-[#F0E2E8] dark:border-[#3B2E38] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4 h-16 px-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const count = id === 'favorites' ? favoritesCount : id === 'history' ? historyCount : 0;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-2xl mx-0.5 my-1 transition-colors focus-visible:outline-2 focus-visible:outline-[#E11D48] ${
                isActive
                  ? 'text-[#5B2333] dark:text-[#FFD6E2] bg-[#FFEAF0] dark:bg-[#3B2531]'
                  : 'text-[#6E5B65] dark:text-[#CBBBC4] hover:bg-[#FFEAF0]/40 dark:hover:bg-[#2E242D]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 ${
                    isActive && id === 'favorites' ? 'fill-[#E11D48] text-[#E11D48]' : ''
                  }`}
                />
                {count > 0 && (
                  <span className="ml-1 text-[10px] font-bold tabular-nums opacity-85">
                    {count}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
