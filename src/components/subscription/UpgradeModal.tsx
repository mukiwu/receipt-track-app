"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "receipt_limit" | "ai_scan_limit" | "feature_locked";
  featureName?: string;
}

const REASONS = {
  receipt_limit: {
    title: "收據額度已達上限",
    description: "本月免費額度 30 筆已用完",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  ai_scan_limit: {
    title: "AI 掃描額度已達上限",
    description: "本月免費額度 10 次已用完",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  feature_locked: {
    title: "Pro 專屬功能",
    description: "升級解鎖完整功能",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
};

const PRO_FEATURES = [
  "無限收據記錄",
  "無限 AI 掃描",
  "電子發票自動同步",
  "資料匯出 (Excel/PDF)",
  "進階圖表分析",
];

export default function UpgradeModal({
  isOpen,
  onClose,
  reason = "feature_locked",
  featureName,
}: UpgradeModalProps) {
  const reasonInfo = REASONS[reason];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* 頂部漸層區 */}
              <div className="bg-gradient-to-br from-[#C41E3A] to-[#9A1428] p-6 text-white text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  {reasonInfo.icon}
                </div>
                <h2 className="text-xl font-bold mb-1">{reasonInfo.title}</h2>
                <p className="text-white/80 text-sm">
                  {featureName || reasonInfo.description}
                </p>
              </div>

              {/* 內容區 */}
              <div className="p-6">
                {/* Pro 方案 */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-mono font-bold">
                        PRO
                      </span>
                      <span className="font-bold text-gray-800">早鳥方案</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">NT$99</span>
                      <span className="text-sm text-gray-500">/月</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {PRO_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 按鈕區 */}
                <div className="space-y-3">
                  <Link
                    href="/#pricing"
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono font-medium text-center hover:shadow-lg transition-all"
                  >
                    升級 Pro
                  </Link>
                  <button
                    onClick={onClose}
                    className="block w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-mono font-medium text-center hover:bg-gray-200 transition-all"
                  >
                    稍後再說
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  隨時可取消訂閱
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

