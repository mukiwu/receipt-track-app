"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ReceiptCategory, CATEGORY_INFO } from "@/types";
import { CategoryIcon } from "./InputScreen";

interface ReceiptPaperProps {
  receipt: Receipt;
  onTear?: () => void;
  isArchived?: boolean;
  onDelete?: () => void;
}

// 簡單的種子隨機數生成器
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// 字母表
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';

export default function ReceiptPaper({
  receipt,
  onTear,
  isArchived = false,
  onDelete,
}: ReceiptPaperProps) {
  const [isTearing, setIsTearing] = useState(false);
  const [showTornPiece, setShowTornPiece] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // 使用 receipt.id 生成種子
  const getSeed = useCallback(() => {
    let seed = 0;
    for (let i = 0; i < receipt.id.length; i++) {
      seed += receipt.id.charCodeAt(i) * (i + 1);
    }
    return seed;
  }, [receipt.id]);

  // 根據種子生成隨機名字
  const generateRandomName = useCallback(() => {
    const seed = getSeed();
    let s = seed;
    const random = () => seededRandom(s++);

    // 隨機字元數 2-5
    const length = 2 + Math.floor(random() * 4);
    let name = '';

    // 第一個字母大寫
    name += UPPERCASE[Math.floor(random() * 26)];

    // 其餘字母小寫
    for (let i = 1; i < length; i++) {
      name += LOWERCASE[Math.floor(random() * 26)];
    }

    return name;
  }, [getSeed]);

  const signatureName = generateRandomName();

  // 格式化日期：2025.11.27 (四) 11:07
  const formatFullDate = (dateStr: string, timeStr: string) => {
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    // dateStr 格式是 "27/11/25"
    const [day, month, year] = dateStr.split("/");
    const fullYear = `20${year}`;
    const date = new Date(`${fullYear}-${month}-${day}`);
    const weekDay = weekDays[date.getDay()];
    return `${fullYear}.${month}.${day} (${weekDay}) ${timeStr}`;
  };

  const handleTear = () => {
    if (onTear) {
      setIsTearing(true);
      setShowTornPiece(true);
      // 同時讓小紙片消失
      setTimeout(() => {
        setShowTornPiece(false);
      }, 150);
      // 立刻回調，讓打字機開始往上移動
      onTear();
    }
  };

  // 長按開始
  const handleTouchStart = () => {
    if (!isArchived) return;
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowActionSheet(true);
      // 觸發震動回饋（如果支援）
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, 500); // 500ms 長按觸發
  };

  // 長按結束
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 處理刪除
  const handleDelete = () => {
    setShowActionSheet(false);
    if (onDelete) {
      onDelete();
    }
  };

  // 關閉選單
  const handleCloseSheet = () => {
    setShowActionSheet(false);
  };

  return (
    <>
      <div className="relative">
        {/* 主收據部分 - 撕開時往上飄走 */}
        <motion.div
          className={`relative ${isArchived ? "cursor-pointer select-none" : ""}`}
          animate={isTearing ? {
            y: -60,
            rotate: -5,
            opacity: 0,
            scale: 0.98,
          } : {}}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          whileHover={!isArchived && !isTearing ? { scale: 1.01 } : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onContextMenu={(e) => {
            if (isArchived) {
              e.preventDefault();
              setShowActionSheet(true);
            }
          }}
        >
          {/* 收據本體 - 底部不要陰影，保持接縫自然 */}
          <div className="receipt-paper rounded-lg rounded-b-none overflow-hidden shadow-none">
          {/* 收據頭部 */}
          <div className="p-5">
            {/* 標題區：Icon + 商店名稱/日期 */}
            <div className="flex items-center gap-2 mb-4">
              {/* 左側：類別 Icon */}
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: `${CATEGORY_INFO[receipt.category || "other"].color}15`,
                  color: CATEGORY_INFO[receipt.category || "other"].color 
                }}
              >
                <CategoryIcon category={receipt.category || "other"} size={22} />
              </div>
              {/* 右側：商店名稱 + 日期 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-mono font-bold text-sm text-thermal-text truncate">
                  {receipt.storeName}
                </h3>
                <p className="font-mono text-xs text-gray-400 mt-0.5">
                  {formatFullDate(receipt.date, receipt.time)}
                </p>
              </div>
              {/* 收據編號 */}
              <div className="font-mono text-[10px] text-gray-400 flex-shrink-0">
                #{receipt.receiptNo}
              </div>
            </div>

            {/* 虛線分隔 */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>

            {/* 項目列表 */}
            <div className="space-y-3 mb-4">
              {receipt.items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="font-mono text-sm text-gray-400 w-4 flex-shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-thermal-text leading-none">
                      {item.name}
                    </p>
                    {item.quantity > 1 && (
                      <p className="font-mono text-xs text-gray-400 mt-1">
                        {item.quantity} × ${item.price.toFixed(0)}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm text-thermal-text font-medium flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* 總計區塊 */}
            <div className="bg-gray-50/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-thermal font-bold text-lg text-thermal-text">
                  總計
                </span>
                <span className="font-mono font-bold text-2xl text-thermal-text">
                  ${receipt.total.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="font-mono">付款方式</span>
                <span className="font-mono">{receipt.paymentMethod}</span>
              </div>
            </div>

            {/* 底部裝飾 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-mono text-[10px] text-gray-400">
                    RECEIPT TRACKER
                  </p>
                  <p className="font-mono text-[10px] text-gray-400">
                    感謝使用
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p
                    className="text-neutral-700 text-2xl"
                    style={{ fontFamily: "'Gama Hend', cursive" }}
                  >
                    {signatureName}
                  </p>
                </div>
              </div>
            </div>

            {/* 印章 */}
            <div className="flex flex-col items-center mt-4">
              <div className="w-14 h-14 border-[1.5px] border-gray-300 rounded-full flex items-center justify-center">
                {/* 細膩的收據圖示 */}
                <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V4l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
                  <line x1="8" y1="9" x2="16" y2="9" />
                  <line x1="8" y1="13" x2="14" y2="13" />
                </svg>
              </div>
            </div>
          </div>

          {/* 撕開時顯示的鋸齒底邊 */}
          {isTearing && (
            <div 
              className="h-3 bg-[#FDFBF7]"
              style={{
                clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
              }}
            />
          )}
        </div>

        {/* 長按提示（僅存檔時顯示） */}
        {isArchived && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-gray-400 font-mono">長按刪除</span>
          </div>
        )}
      </motion.div>

      {/* 撕下的小紙片 - 裁切線以下部分 */}
      <AnimatePresence>
        {showTornPiece && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="receipt-paper rounded-lg rounded-t-none overflow-hidden"
          >
            {/* 撕開的鋸齒頂邊 */}
            <div 
              className="h-3 bg-[#FDFBF7]"
              style={{
                clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
              }}
            />
            <div className="py-2 px-4 flex flex-col items-center">
              <span className="font-mono text-[10px] text-gray-400 tracking-widest">
                ✂ 已撕開
              </span>
            </div>
            {/* 鋸齒撕邊 */}
            <div className="tear-edge" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 裁切線區域 - 可點擊撕開（未撕開時顯示） */}
      {!isArchived && onTear && !isTearing && (
        <motion.button
          onClick={handleTear}
          className="w-full receipt-paper rounded-lg rounded-t-none py-3 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50/50 transition-colors group overflow-hidden"
          whileTap={{ scale: 0.98 }}
        >
          {/* 虛線裁切線 */}
          <div className="w-full flex items-center gap-1 px-4">
            <div className="flex-1 border-t-2 border-dashed border-gray-300 group-hover:border-red-300 transition-colors" />
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
            <div className="flex-1 border-t-2 border-dashed border-gray-300 group-hover:border-red-300 transition-colors" />
          </div>
          <span className="font-mono text-[10px] text-gray-400 tracking-widest group-hover:text-red-400 transition-colors">
            ✂ 點擊撕開收據
          </span>
          {/* 鋸齒撕邊 */}
          <div className="tear-edge" />
        </motion.button>
      )}
      </div>

      {/* iOS 風格的 Action Sheet */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={handleCloseSheet}
            />
            
            {/* Action Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
            >
              {/* 選項卡片 */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl overflow-hidden mb-2 shadow-xl">
                {/* 標題 */}
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <p className="text-center text-sm text-gray-500 font-medium">
                    {receipt.storeName}
                  </p>
                  <p className="text-center text-xs text-gray-400">
                    ${receipt.total.toFixed(0)} · {receipt.date}
                  </p>
                </div>
                
                {/* 刪除按鈕 */}
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-4 text-center text-red-500 text-lg font-medium active:bg-gray-100 transition-colors"
                >
                  刪除收據
                </button>
              </div>
              
              {/* 取消按鈕 */}
              <button
                onClick={handleCloseSheet}
                className="w-full bg-white/95 backdrop-blur-lg rounded-2xl px-4 py-4 text-center text-blue-500 text-lg font-semibold shadow-xl active:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
