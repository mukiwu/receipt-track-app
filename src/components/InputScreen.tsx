"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReceiptItem, PrinterState, ReceiptCategory, CATEGORY_INFO } from "@/types";

// 類別 Icon 組件
const CategoryIcon = ({ category, size = 16 }: { category: ReceiptCategory; size?: number }) => {
  const icons: Record<ReceiptCategory, JSX.Element> = {
    food: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
    shopping: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    transport: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    entertainment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
    daily: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    medical: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    other: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };
  return icons[category];
};

interface InputScreenProps {
  mode: "store" | "item" | "done";
  storeName: string;
  category: ReceiptCategory;
  items: ReceiptItem[];
  currentItemName: string;
  currentItemPrice: string;
  currentItemQty: string;
  paymentMethod: string;
  printerState: PrinterState;
  savedStoreNames: string[];
  onStoreNameChange: (value: string) => void;
  onCategoryChange: (value: ReceiptCategory) => void;
  onItemNameChange: (value: string) => void;
  onItemPriceChange: (value: string) => void;
  onItemQtyChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onAddItem: () => void;
  onModeChange: (mode: "store" | "item" | "done") => void;
  onRemoveItem: (id: string) => void;
}

export { CategoryIcon };

export default function InputScreen({
  mode,
  storeName,
  category,
  items,
  currentItemName,
  currentItemPrice,
  currentItemQty,
  paymentMethod,
  printerState,
  savedStoreNames,
  onStoreNameChange,
  onCategoryChange,
  onItemNameChange,
  onItemPriceChange,
  onItemQtyChange,
  onPaymentMethodChange,
  onAddItem,
  onModeChange,
  onRemoveItem,
}: InputScreenProps) {
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 復古綠色終端風格
  const textColor = "text-[#4ADE80]";
  const textColorDim = "text-[#4ADE80]/60";
  const textColorBright = "text-[#6EE7A0]";
  const accentColor = "text-[#FBBF24]";

  return (
    <div className={`font-mono ${textColor}`}>
      {/* 商店名稱輸入 */}
      {mode === "store" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {/* 類別選擇 */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <span className={`${accentColor} mr-2`}>▶</span>
              <span className="text-xs" style={{ textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
                選擇類別
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-5">
              {(Object.keys(CATEGORY_INFO) as ReceiptCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${
                    category === cat
                      ? "bg-[#4ADE80]/20 border border-[#4ADE80]/60"
                      : "border border-[#4ADE80]/20 hover:border-[#4ADE80]/40"
                  }`}
                  style={{ color: category === cat ? CATEGORY_INFO[cat].color : undefined }}
                >
                  <CategoryIcon category={cat} size={12} />
                  <span>{CATEGORY_INFO[cat].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 商店名稱 */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className={`${accentColor} mr-2`}>▶</span>
              <span className="text-xs" style={{ textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
                輸入商店名稱
              </span>
            </div>
            {/* 歷史記錄下拉選單 */}
            {savedStoreNames.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onStoreNameChange(e.target.value);
                    inputRef.current?.focus();
                  }
                }}
                className="bg-[#1a2318] border border-[#4ADE80]/40 rounded text-[10px] text-[#4ADE80] px-1 py-0.5 outline-none cursor-pointer"
                style={{ maxWidth: "70px" }}
              >
                <option value="">快速選擇</option>
                {savedStoreNames.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center pl-5 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={storeName}
              onChange={(e) => onStoreNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && storeName) {
                  onModeChange("item");
                }
              }}
              placeholder="例：7-ELEVEN"
              className={`bg-transparent border-none outline-none ${textColorBright} text-xs flex-1 placeholder:${textColorDim}`}
              style={{ textShadow: "0 0 8px rgba(74,222,128,0.4)" }}
              autoFocus
            />
            <span
              className={`${textColorBright} ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ textShadow: "0 0 10px rgba(74,222,128,0.8)" }}
            >
              █
            </span>
          </div>
          {storeName && (
            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onModeChange("item")}
              className={`mt-2 px-3 py-1 border border-[#4ADE80]/40 ${textColor} text-xs rounded hover:bg-[#4ADE80]/10 transition-colors`}
            >
              繼續 →
            </motion.button>
          )}
        </motion.div>
      )}

      {/* 項目輸入 */}
      {mode === "item" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1"
        >
          {/* 標題列 */}
          <div className="flex items-center justify-between text-xs border-b border-[#4ADE80]/20 pb-1">
            <span className={textColorDim}>📍 {storeName}</span>
            <span className={`${accentColor} font-bold`}>
              ${total.toFixed(0)}
            </span>
          </div>

          {/* 已添加項目列表 */}
          <div className="max-h-[50px] overflow-y-auto space-y-0.5 py-1">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`flex items-center justify-between text-[11px] ${textColorDim}`}
                >
                  <span className="truncate flex-1">
                    {String(index + 1).padStart(2, '0')}│{item.name} ×{item.quantity}
                  </span>
                  <span className={textColor}>${(item.price * item.quantity).toFixed(0)}</span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-2 text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 新增項目 */}
          <div className="space-y-1 border-t border-[#4ADE80]/20 pt-2">
            <div className="flex items-center gap-2">
              <span className={accentColor}>▶</span>
              <input
                type="text"
                value={currentItemName}
                onChange={(e) => onItemNameChange(e.target.value)}
                placeholder="品名"
                className={`bg-transparent border-none outline-none ${textColorBright} text-xs flex-1 placeholder:text-[#4ADE80]/30`}
                style={{ textShadow: "0 0 6px rgba(74,222,128,0.3)" }}
              />
            </div>
            <div className="flex items-center gap-2 pl-5 text-xs">
              <span className={textColorDim}>數量:</span>
              <input
                type="number"
                value={currentItemQty}
                onChange={(e) => onItemQtyChange(e.target.value)}
                className={`bg-transparent border-none outline-none ${textColor} w-8 text-center`}
                min="1"
              />
              <span className={textColorDim}>×</span>
              <span className={textColorDim}>$</span>
              <input
                type="number"
                value={currentItemPrice}
                onChange={(e) => onItemPriceChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, onAddItem)}
                placeholder="單價"
                className={`bg-transparent border-none outline-none ${textColorBright} w-16 placeholder:text-[#4ADE80]/30`}
              />
              <span
                className={`${textColorBright} ${
                  cursorVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                █
              </span>
            </div>
          </div>

          {/* 付款方式 */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#4ADE80]/20 mt-2">
            <span className={`${textColorDim} text-[10px]`}>付款:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="現金"
                checked={paymentMethod === "現金"}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-3 h-3 accent-[#4ADE80]"
              />
              <span className={`text-[10px] ${paymentMethod === "現金" ? textColorBright : textColorDim}`}>
                現金
              </span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="信用卡"
                checked={paymentMethod === "信用卡"}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-3 h-3 accent-[#4ADE80]"
              />
              <span className={`text-[10px] ${paymentMethod === "信用卡" ? textColorBright : textColorDim}`}>
                信用卡
              </span>
            </label>
          </div>

          {/* 操作按鈕 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onAddItem}
              disabled={!currentItemName || !currentItemPrice}
              className={`px-2 py-0.5 border border-[#4ADE80]/40 ${textColor} text-[10px] rounded hover:bg-[#4ADE80]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              [+] 新增
            </button>
            <button
              onClick={() => onModeChange("store")}
              className={`px-2 py-0.5 border border-[#4ADE80]/20 ${textColorDim} text-[10px] rounded hover:bg-[#4ADE80]/10 transition-colors`}
            >
              [←] 返回
            </button>
          </div>
        </motion.div>
      )}

      {/* 打印中狀態 */}
      {printerState.status === "printing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-[120px]"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-[#4ADE80] border-t-transparent rounded-full"
              style={{ boxShadow: "0 0 15px rgba(74,222,128,0.4)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-[#4ADE80] rounded-full animate-pulse" 
                style={{ boxShadow: "0 0 10px rgba(74,222,128,0.8)" }} />
            </div>
          </div>
          <motion.span 
            className={`mt-3 ${textColorBright} text-sm`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ textShadow: "0 0 10px rgba(74,222,128,0.6)" }}
          >
            ▓▓▓ PRINTING ▓▓▓
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
