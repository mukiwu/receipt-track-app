"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt } from "@/types";
import ReceiptPaper from "./ReceiptPaper";
import ScrollPicker from "./ScrollPicker";

interface ArchiveProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
}

type FilterType = "all" | "year" | "month" | "day";

export default function Archive({ receipts, onDelete }: ArchiveProps) {
  const [filterType, setFilterType] = useState<FilterType>("all"); // 預設顯示所有收據

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

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.total, 0);

  // 切換篩選類型（日期已在 state 初始化為當前日期）
  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    // 狀態已經初始化為當前日期，不需要重置
  };

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div id="archive-section" className="w-[320px] mt-8">
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
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <span className="font-mono text-sm tracking-[0.3em] text-gray-500">
          ARCHIVE
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      {/* 篩選器 */}
      <div className="receipt-paper rounded-lg p-4 mb-4 space-y-3">
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

      {/* 統計資訊 */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="font-mono text-xs text-gray-500">
          {filteredReceipts.length} 筆記錄
        </span>
        <span className="font-mono text-sm text-thermal-text font-bold">
          總計 ${totalAmount.toFixed(0)}
        </span>
      </div>

      {/* 收據列表 */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredReceipts.length > 0 ? (
            filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <ReceiptPaper
                  receipt={receipt}
                  isArchived={true}
                  onDelete={() => onDelete(receipt.id)}
                />
              </motion.div>
            ))
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-mono text-sm">此期間無記錄</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
