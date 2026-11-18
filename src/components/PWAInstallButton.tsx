import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="Cài ứng dụng vào màn hình chính"
        className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-[#FFEAF0] dark:bg-[#3B2531] text-[#5B2333] dark:text-[#FFD6E2] text-xs font-semibold hover:bg-[#FFB6C1]/40 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Cài app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Hướng dẫn thêm vào màn hình chính iPhone"
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-[#FFEAF0] dark:bg-[#3B2531] text-[#5B2333] dark:text-[#FFD6E2] text-xs font-semibold hover:bg-[#FFB6C1]/40 transition-colors whitespace-nowrap shrink-0"
        >
          <Share className="w-4 h-4 shrink-0" />
          <span>Lưu app</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF8] dark:bg-[#251D24] border border-[#F3E8EE] dark:border-[#3B2E38] p-5 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="ios-install-title"
                  className="text-base font-bold text-[#2D2229] dark:text-[#FDF7F9]"
                >
                  Thêm vào màn hình chính iPhone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Đóng hướng dẫn"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6E5B65] dark:text-[#CBBBC4] hover:bg-[#FFEAF0]/60 dark:hover:bg-[#3B2531]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[#4A3B43] dark:text-[#E5D7DF]">
                <li>1. Chạm biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh Safari.</li>
                <li>2. Kéo xuống và chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.</li>
                <li>3. Mở app ngay từ màn hình chính mỗi lúc phân vân ăn gì!</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full min-h-[44px] rounded-2xl bg-[#FFB6C1] text-[#5B2333] font-bold text-sm hover:brightness-95 transition"
              >
                Đã hiểu rồi nha
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
