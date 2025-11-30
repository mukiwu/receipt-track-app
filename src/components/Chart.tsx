"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Receipt, CATEGORY_INFO, ReceiptCategory } from "@/types";
import ScrollPicker from "./ScrollPicker";

interface ChartProps {
  receipts: Receipt[];
}

type FilterType = "all" | "year" | "month" | "day";

export default function Chart({ receipts }: ChartProps) {
  const [filterType, setFilterType] = useState<FilterType>("day"); // 預設為日篩選

  // 初始化為當前日期
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((now.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedDay, setSelectedDay] = useState<string>(now.getDate().toString().padStart(2, '0'));

  // 解析日期字串 "DD/MM/YY" -> { year, month, day }
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return {
      year: `20${year}`,
      month,
      day,
    };
  };

  // 生成年份選項（從 2025 年開始到當前年份）
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = 2025; year <= currentYear; year++) {
      years.push(year.toString());
    }
    return years.reverse(); // 最新年份在前
  }, []);

  // 生成月份選項（1-12 月）
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );
  }, []);

  // 生成日期選項（1-31 日）
  const dayOptions = useMemo(() => {
    // 根據選擇的年月計算該月有多少天
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );
  }, [selectedYear, selectedMonth]);

  // 篩選收據
  const filteredReceipts = useMemo(() => {
    if (filterType === "all") return receipts;

    return receipts.filter((r) => {
      const { year, month, day } = parseDate(r.date);

      if (filterType === "year") {
        return year === selectedYear;
      }

      if (filterType === "month") {
        return year === selectedYear && month === selectedMonth;
      }

      if (filterType === "day") {
        return (
          year === selectedYear &&
          month === selectedMonth &&
          day === selectedDay
        );
      }

      return true;
    });
  }, [receipts, filterType, selectedYear, selectedMonth, selectedDay]);

  // 計算類別統計
  const categoryStats = useMemo(() => {
    const stats: Record<ReceiptCategory, { count: number; total: number }> = {
      food: { count: 0, total: 0 },
      shopping: { count: 0, total: 0 },
      transport: { count: 0, total: 0 },
      entertainment: { count: 0, total: 0 },
      daily: { count: 0, total: 0 },
      medical: { count: 0, total: 0 },
      other: { count: 0, total: 0 },
    };

    filteredReceipts.forEach((receipt) => {
      const category = receipt.category || "other";
      stats[category].count += 1;
      stats[category].total += receipt.total;
    });

    return stats;
  }, [filteredReceipts]);

  // 計算總金額
  const totalAmount = useMemo(() => {
    return filteredReceipts.reduce((sum, r) => sum + r.total, 0);
  }, [filteredReceipts]);

  // 排序類別（按金額由高到低）
  const sortedCategories = useMemo(() => {
    return (Object.keys(categoryStats) as ReceiptCategory[])
      .filter((cat) => categoryStats[cat].count > 0)
      .sort((a, b) => categoryStats[b].total - categoryStats[a].total);
  }, [categoryStats]);

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div id="chart-section" className="w-[320px] md:w-full md:max-w-4xl mt-8">
      {/* 標題區 */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="font-mono text-sm tracking-[0.3em] text-gray-500">
          CHART
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      {/* 篩選器 */}
      <div className="receipt-paper rounded-lg p-4 mb-4 space-y-3 md:max-w-md md:mx-auto">
        {/* 切換按鈕 */}
        <button
          onClick={() => setFilterType(filterType === "all" ? "day" : "all")}
          className="w-full py-2 px-3 rounded-lg font-mono text-xs transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
        >
          {filterType === "all" ? "📅 按日期篩選" : "📋 顯示全部"}
        </button>

        {/* 滾輪選擇器 - 預設顯示 */}
        {filterType !== "all" && (
          <>
            {/* 篩選精度選擇 */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilterType("year")}
                className={`py-1.5 px-2 rounded font-mono text-xs transition-all ${
                  filterType === "year"
                    ? "bg-thermal-amber text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                年
              </button>
              <button
                onClick={() => setFilterType("month")}
                className={`py-1.5 px-2 rounded font-mono text-xs transition-all ${
                  filterType === "month"
                    ? "bg-thermal-amber text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                月
              </button>
              <button
                onClick={() => setFilterType("day")}
                className={`py-1.5 px-2 rounded font-mono text-xs transition-all ${
                  filterType === "day"
                    ? "bg-thermal-amber text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                日
              </button>
            </div>

            {/* 滾輪選擇器 */}
            <div className="grid grid-cols-3 gap-3">
              {/* 年份滾輪 */}
              <ScrollPicker
                items={yearOptions}
                selectedValue={selectedYear}
                onChange={setSelectedYear}
                unit=""
              />

              {/* 月份滾輪 */}
              <ScrollPicker
                items={monthOptions}
                selectedValue={selectedMonth}
                onChange={setSelectedMonth}
                unit=""
              />

              {/* 日期滾輪 */}
              <ScrollPicker
                items={dayOptions}
                selectedValue={selectedDay}
                onChange={setSelectedDay}
                unit=""
              />
            </div>
          </>
        )}
      </div>

      {/* 桌面版使用並排佈局 */}
      <div className="md:grid md:grid-cols-2 md:gap-6">
        {/* 總計卡片 */}
        <div className="receipt-paper rounded-lg p-5 mb-4 md:mb-0">
          <div className="text-center">
            <p className="font-mono text-xs md:text-sm text-gray-500 mb-2">總支出</p>
            <p className="font-mono text-3xl md:text-4xl font-bold text-thermal-text">
              ${totalAmount.toFixed(0)}
            </p>
            <p className="font-mono text-xs text-gray-400 mt-2">
              {filteredReceipts.length} 筆記錄
            </p>
          </div>
        </div>

        {/* 類別統計 */}
        {sortedCategories.length > 0 ? (
          <div className="receipt-paper rounded-lg p-5 space-y-4">
            <h3 className="font-mono text-xs md:text-sm text-gray-500 text-center mb-4">
              類別統計
            </h3>

            {sortedCategories.map((category, index) => {
            const stat = categoryStats[category];
            const percentage = totalAmount > 0 ? (stat.total / totalAmount) * 100 : 0;
            const categoryInfo = CATEGORY_INFO[category];

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                {/* 類別資訊 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: categoryInfo.color }}
                    />
                    <span className="font-mono text-xs text-gray-600">
                      {categoryInfo.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-thermal-text">
                      ${stat.total.toFixed(0)}
                    </p>
                    <p className="font-mono text-[10px] text-gray-400">
                      {stat.count} 筆
                    </p>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: categoryInfo.color }}
                  />
                </div>

                {/* 百分比 */}
                <div className="text-right">
                  <span className="font-mono text-[10px] text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="receipt-paper rounded-lg p-8 text-center"
          >
            <div className="text-gray-400 space-y-2">
              <svg
                className="w-12 h-12 mx-auto opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="font-mono text-sm">此期間無記錄</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
