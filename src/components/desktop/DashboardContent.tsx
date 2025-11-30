"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Receipt, CATEGORY_INFO, ReceiptCategory } from "@/types";
import Printer from "../Printer";

interface DashboardContentProps {
  receipts: Receipt[];
  onReceiptSaved: (receipt: Receipt) => void;
  onShowCameraScan: () => void;
  onShowSettings: () => void;
  isAIConfigured: boolean;
  unreadAchievements: number;
  onShowChart: () => void;
  onShowArchive: () => void;
  onShowAchievements: () => void;
}

export default function DashboardContent({
  receipts,
  onReceiptSaved,
  onShowCameraScan,
  onShowSettings,
  isAIConfigured,
  unreadAchievements,
  onShowChart,
  onShowArchive,
  onShowAchievements,
}: DashboardContentProps) {
  // 計算統計數據
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    let thisMonthTotal = 0;
    let thisMonthCount = 0;
    const categoryTotals: Record<string, number> = {};

    receipts.forEach((receipt) => {
      const [, month, year] = receipt.date.split("/");
      const fullYear = parseInt(`20${year}`);
      const monthNum = parseInt(month);

      if (fullYear === thisYear && monthNum === thisMonth) {
        thisMonthTotal += receipt.total;
        thisMonthCount++;
      }

      // 類別統計
      const category = receipt.category || "other";
      categoryTotals[category] = (categoryTotals[category] || 0) + receipt.total;
    });

    // 找出最高消費類別
    let topCategory: ReceiptCategory = "other";
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (amount > topCategoryAmount) {
        topCategory = cat as ReceiptCategory;
        topCategoryAmount = amount;
      }
    });

    return {
      thisMonthTotal,
      thisMonthCount,
      totalReceipts: receipts.length,
      topCategory,
      topCategoryAmount,
      categoryTotals,
    };
  }, [receipts]);

  // 最近收據（最多 5 筆）
  const recentReceipts = useMemo(() => {
    return receipts.slice(0, 5);
  }, [receipts]);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 左側：打字機 */}
      <div className="col-span-12 xl:col-span-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Printer
            onReceiptSaved={onReceiptSaved}
            onShowChart={onShowChart}
            onShowArchive={onShowArchive}
            onShowAchievements={onShowAchievements}
            unreadAchievements={unreadAchievements}
            onShowCameraScan={onShowCameraScan}
            onShowSettings={onShowSettings}
            isAIConfigured={isAIConfigured}
          />
        </motion.div>
      </div>

      {/* 右側：統計卡片與最近收據 */}
      <div className="col-span-12 xl:col-span-7 space-y-6">
        {/* 統計卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 本月支出 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="receipt-paper rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#C41E3A]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-mono text-xs text-gray-500">本月支出</span>
            </div>
            <p className="font-mono text-2xl font-bold text-gray-800">
              ${stats.thisMonthTotal.toLocaleString()}
            </p>
          </motion.div>

          {/* 本月筆數 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="receipt-paper rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-mono text-xs text-gray-500">本月筆數</span>
            </div>
            <p className="font-mono text-2xl font-bold text-gray-800">
              {stats.thisMonthCount}
            </p>
          </motion.div>

          {/* 總收據數 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="receipt-paper rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-mono text-xs text-gray-500">總收據數</span>
            </div>
            <p className="font-mono text-2xl font-bold text-gray-800">
              {stats.totalReceipts}
            </p>
          </motion.div>

          {/* 最高類別 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="receipt-paper rounded-xl p-4 shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${CATEGORY_INFO[stats.topCategory].color}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_INFO[stats.topCategory].color }}
                />
              </div>
              <span className="font-mono text-xs text-gray-500">最高類別</span>
            </div>
            <p className="font-mono text-lg font-bold text-gray-800">
              {CATEGORY_INFO[stats.topCategory].label}
            </p>
            <p className="font-mono text-xs text-gray-500">
              ${stats.topCategoryAmount.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* 最近收據 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="receipt-paper rounded-xl p-5 shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-gray-700">最近收據</h3>
            <button
              onClick={onShowArchive}
              className="font-mono text-xs text-[#C41E3A] hover:text-[#9A1428] transition-colors"
            >
              查看全部 →
            </button>
          </div>

          {recentReceipts.length > 0 ? (
            <div className="space-y-3">
              {recentReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${CATEGORY_INFO[receipt.category || "other"].color}15`,
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: CATEGORY_INFO[receipt.category || "other"].color,
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-gray-800">{receipt.storeName}</p>
                      <p className="font-mono text-[10px] text-gray-400">
                        {receipt.date} {receipt.time}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold text-gray-800">
                    ${receipt.total.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="font-mono text-sm text-gray-400">還沒有收據</p>
              <p className="font-mono text-xs text-gray-400 mt-1">
                使用左側打字機記錄您的第一筆消費吧！
              </p>
            </div>
          )}
        </motion.div>

        {/* 類別分布 */}
        {Object.keys(stats.categoryTotals).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="receipt-paper rounded-xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-sm font-bold text-gray-700">類別分布</h3>
              <button
                onClick={onShowChart}
                className="font-mono text-xs text-[#C41E3A] hover:text-[#9A1428] transition-colors"
              >
                查看詳細 →
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(stats.categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const total = Object.values(stats.categoryTotals).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (amount / total) * 100 : 0;
                  const info = CATEGORY_INFO[category as ReceiptCategory] || CATEGORY_INFO.other;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: info.color }}
                          />
                          <span className="font-mono text-xs text-gray-600">{info.label}</span>
                        </div>
                        <span className="font-mono text-xs text-gray-800 font-medium">
                          ${amount.toLocaleString()} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

