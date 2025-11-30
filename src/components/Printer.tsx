"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ReceiptItem, PrinterState, ReceiptCategory } from "@/types";
import ReceiptPaper from "./ReceiptPaper";
import InputScreen from "./InputScreen";
import { useStoreNames } from "@/hooks/useStoreNames";
import { v4 as uuidv4 } from "uuid";
import { trackReceiptCreated } from "@/utils/analytics";

interface PrinterProps {
  onReceiptSaved: (receipt: Receipt) => void;
  onShowChart: () => void;
  onShowArchive: () => void;
  onShowAchievements: () => void;
  unreadAchievements?: number;
  onShowCameraScan?: () => void;
  onShowSettings?: () => void;
  isAIConfigured?: boolean;
}

export default function Printer({ onReceiptSaved, onShowChart, onShowArchive, onShowAchievements, unreadAchievements = 0, onShowCameraScan, onShowSettings, isAIConfigured = false }: PrinterProps) {
  const [printerState, setPrinterState] = useState<PrinterState>({
    status: "ready",
    message: "",
  });
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [inputMode, setInputMode] = useState<"store" | "item" | "done">("store");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState<ReceiptCategory>("food");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [currentItemName, setCurrentItemName] = useState("");
  const [currentItemPrice, setCurrentItemPrice] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("現金");
  const printerRef = useRef<HTMLDivElement>(null);
  
  // 商店名稱記憶功能
  const { storeNames, saveStoreName } = useStoreNames();

  const generateReceiptNo = () => {
    return Math.random().toString(16).substring(2, 8).toUpperCase();
  };

  // 格式化日期 YYYY.MM.DD
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}.${month}.${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAddItem = () => {
    if (currentItemName && currentItemPrice) {
      const newItem: ReceiptItem = {
        id: uuidv4(),
        name: currentItemName,
        quantity: parseInt(currentItemQty) || 1,
        price: parseFloat(currentItemPrice) || 0,
      };
      setItems([...items, newItem]);
      setCurrentItemName("");
      setCurrentItemPrice("");
      setCurrentItemQty("1");
    }
  };

  const handlePrint = () => {
    if (!storeName || items.length === 0) {
      setPrinterState({ status: "ready", message: "請輸入商店名稱和至少一個項目" });
      return;
    }

    setPrinterState({ status: "printing", message: "PRINTING..." });

    const now = new Date();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const receipt: Receipt = {
      id: uuidv4(),
      receiptNo: generateReceiptNo(),
      date: formatDate(now),
      time: formatTime(now),
      storeName,
      category,
      items,
      total,
      paymentMethod,
      createdAt: now.getTime(),
    };

    // 儲存商店名稱到記憶中
    saveStoreName(storeName);
    
    setCurrentReceipt(receipt);

    setTimeout(() => {
      setShowReceipt(true);
      setPrinterState({ status: "done", message: "COMPLETE" });
    }, 1500);
  };

  const handleTear = () => {
    if (currentReceipt) {
      // 追蹤手動建立的收據
      trackReceiptCreated({
        category: currentReceipt.category,
        total: currentReceipt.total,
        item_count: currentReceipt.items.length,
        payment_method: currentReceipt.paymentMethod,
        source: "manual",
      });
      onReceiptSaved(currentReceipt);
    }
    
    setTimeout(() => {
      setShowReceipt(false);
      setCurrentReceipt(null);
      setStoreName("");
      setItems([]);
      setInputMode("store");
      setPrinterState({ status: "ready", message: "" });
    }, 500);
  };

  // 重置全部 - 清空所有輸入，回到初始狀態
  const handleReset = () => {
    setShowReceipt(false);
    setCurrentReceipt(null);
    setStoreName("");
    setCategory("food");
    setItems([]);
    setCurrentItemName("");
    setCurrentItemPrice("");
    setCurrentItemQty("1");
    setPaymentMethod("現金");
    setInputMode("store");
    setPrinterState({ status: "ready", message: "" });
  };

  // 清除當前項目 - 只清除正在輸入的品名、數量、價格
  const handleClearItem = () => {
    setCurrentItemName("");
    setCurrentItemPrice("");
    setCurrentItemQty("1");
  };

  // 新記帳 - 保留存檔，開始新的記帳
  const handleNewReceipt = () => {
    setShowReceipt(false);
    setCurrentReceipt(null);
    setStoreName("");
    setCategory("food");
    setItems([]);
    setCurrentItemName("");
    setCurrentItemPrice("");
    setCurrentItemQty("1");
    setPaymentMethod("現金");
    setInputMode("store");
    setPrinterState({ status: "ready", message: "" });
  };

  // DEBUG: 快速測試動畫
  const handleDebugPrint = () => {
    // 先重置
    setShowReceipt(false);
    setCurrentReceipt(null);
    
    setTimeout(() => {
      setPrinterState({ status: "printing", message: "PRINTING..." });
      
      const now = new Date();
      const testReceipt: Receipt = {
        id: uuidv4(),
        receiptNo: generateReceiptNo(),
        date: formatDate(now),
        time: formatTime(now),
        storeName: "測試商店",
        category: "food",
        items: [
          { id: "1", name: "測試商品 A", quantity: 2, price: 100 },
          { id: "2", name: "測試商品 B", quantity: 1, price: 250 },
          { id: "3", name: "測試商品 C", quantity: 3, price: 50 },
        ],
        total: 500,
        paymentMethod: "現金",
        createdAt: now.getTime(),
      };
      
      setCurrentReceipt(testReceipt);
      
      setTimeout(() => {
        setShowReceipt(true);
        setPrinterState({ status: "done", message: "COMPLETE" });
      }, 500);
    }, 100);
  };

  // 滾動到存檔區域
  const handleScrollToArchive = () => {
    const archiveSection = document.getElementById("archive-section");
    if (archiveSection) {
      archiveSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 復古按鍵組件
  const RetroKey = ({
    children,
    onClick,
    disabled = false,
    size = "normal",
    variant = "default",
    className = ""
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: "normal" | "large";
    variant?: "default" | "accent";
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group
        ${size === "large" ? "w-16 h-16" : "w-11 h-11"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* 按鍵底座陰影 */}
      <div className={`
        absolute inset-0 rounded-full 
        ${variant === "accent" 
          ? "bg-[#8B2E1A]" 
          : "bg-[#2A2520]"
        }
        translate-y-1 group-active:translate-y-0 transition-transform
      `} />
      {/* 按鍵主體 */}
      <div className={`
        relative w-full h-full rounded-full 
        flex items-center justify-center
        font-mono text-xs font-bold tracking-wider
        shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]
        group-active:translate-y-1 transition-transform
        ${variant === "accent"
          ? "bg-gradient-to-b from-[#E84830] to-[#C83820] text-white"
          : "bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D4] text-[#3A3530]"
        }
      `}>
        {/* 按鍵內圈 */}
        <div className={`
          absolute inset-1 rounded-full border
          ${variant === "accent"
            ? "border-[#FF6050]/30"
            : "border-white/50"
          }
        `} />
        {children}
      </div>
    </button>
  );

  const receiptContainerRef = useRef<HTMLDivElement>(null);
  const receiptInnerRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0); // 0 = 開始, 1 = 完成
  const [receiptHeight, setReceiptHeight] = useState(0);

  // 收據推出動畫
  useEffect(() => {
    if (showReceipt && currentReceipt) {
      setAnimationProgress(0);
      
      // 延遲測量高度，確保 DOM 已渲染
      const measureTimer = setTimeout(() => {
        if (receiptInnerRef.current) {
          const height = receiptInnerRef.current.getBoundingClientRect().height;
          setReceiptHeight(height);
          
          // 開始動畫
          const startTime = Date.now();
          const duration = 2500;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            setAnimationProgress(eased);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      }, 100);
      
      return () => clearTimeout(measureTimer);
    } else {
      setAnimationProgress(0);
      setReceiptHeight(0);
    }
  }, [showReceipt, currentReceipt]);

  // 計算當前容器高度
  const currentContainerHeight = receiptHeight > 0 ? receiptHeight * animationProgress : 0;

  return (
    <div className="relative flex flex-col items-center" ref={printerRef}>
      {/* 隱藏的測量用元素 - 需要包含 onTear 來正確測量裁切線高度 */}
      {showReceipt && currentReceipt && (
        <div 
          ref={receiptInnerRef}
          className="absolute opacity-0 pointer-events-none w-[300px]"
          style={{ visibility: 'hidden' }}
        >
          <ReceiptPaper receipt={currentReceipt} onTear={() => {}} />
        </div>
      )}
      
      {/* 收據列印區域 - 從打字機往上推出，同時把打字機往下推 */}
      <motion.div 
        ref={receiptContainerRef} 
        className="relative w-[300px]"
        animate={{ height: currentContainerHeight }}
        transition={{ 
          duration: showReceipt ? 2.5 : 0.4,
          ease: showReceipt ? [0.05, 0.7, 0.1, 1] : [0.4, 0, 0.2, 1],
        }}
      >
        <AnimatePresence>
          {showReceipt && currentReceipt && receiptHeight > 0 && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0, 
                y: -30,
                rotate: -2,
              }}
              className="w-full"
            >
              <ReceiptPaper receipt={currentReceipt} onTear={handleTear} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 復古打字機主體 */}
      <div className="relative w-[360px]">
        {/* ===== 紙張滾軸區域 ===== */}
        <div className="relative mx-auto w-[92%] z-10">
          {/* 滾軸支架 - 左 */}
          <div className="absolute left-2 top-0 w-6 h-10 bg-gradient-to-b from-[#4A4540] to-[#3A3530] rounded-t-lg z-20 shadow-lg">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-[#888] to-[#555] shadow-inner" />
          </div>
          
          {/* 滾軸支架 - 右 */}
          <div className="absolute right-2 top-0 w-6 h-10 bg-gradient-to-b from-[#4A4540] to-[#3A3530] rounded-t-lg z-20 shadow-lg">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-[#888] to-[#555] shadow-inner" />
          </div>
          
          {/* 主滾軸 */}
          <div className="relative mx-8 h-8 bg-gradient-to-b from-[#2A2520] to-[#1A1510] rounded-lg flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            {/* 滾軸紋理 */}
            <div className="absolute inset-x-4 h-4 flex items-center justify-between">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-[2px] h-full bg-[#3A3530] rounded-full" />
              ))}
            </div>
            {/* 中間刻度尺 */}
            <div className="absolute inset-x-8 top-1 h-1 bg-gradient-to-r from-transparent via-[#F5F0E8]/80 to-transparent flex items-center justify-center">
              <div className="flex gap-2">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className={`${i % 5 === 0 ? 'w-[2px] h-2' : 'w-[1px] h-1'} bg-[#8A8580]`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 打字機外殼 - 上半部（機械區） ===== */}
        <div className="relative bg-gradient-to-b from-[#C41E3A] via-[#B01830] to-[#9A1428] rounded-t-[40px] pt-4 pb-2 -mt-4 shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]">
          {/* 金屬光澤效果 */}
          <div className="absolute inset-0 rounded-t-[40px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          
          {/* 曲線凹槽 - 打字輪區域 */}
          <div className="relative mx-6 mt-2">
            {/* 凹槽外框 */}
            <div className="relative bg-gradient-to-b from-[#1A1510] to-[#0A0805] rounded-t-[60px] pt-4 pb-3 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
              {/* 打字輪裝飾 */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-b-[40px] bg-gradient-to-b from-[#2A2520] to-[#1A1510] shadow-inner flex items-end justify-center pb-1">
                <div className="flex gap-[2px]">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-[3px] h-3 bg-[#3A3530] rounded-t-sm" />
                  ))}
                </div>
              </div>
              
              {/* 品牌標誌 */}
              <div className="flex justify-center mt-4 mb-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#C41E3A] rounded-full shadow-lg">
                  {/* 細膩的收據圖示 */}
                  <svg className="w-3.5 h-3.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V4l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
                    <line x1="8" y1="9" x2="16" y2="9" />
                    <line x1="8" y1="13" x2="14" y2="13" />
                  </svg>
                  <span className="font-mono text-[9px] tracking-[0.15em] text-white/90 font-bold">
                    RECEIPT TRACKER
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 打字機外殼 - 下半部（鍵盤區） ===== */}
        <div className="relative bg-gradient-to-b from-[#9A1428] via-[#B01830] to-[#C41E3A] rounded-b-[20px] pt-1 pb-6 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_-2px_0_rgba(0,0,0,0.2)]">
          {/* 金屬光澤 */}
          <div className="absolute inset-0 rounded-b-[20px] bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
          
          {/* 螢幕區域（取代鍵盤） */}
          <div className="relative mx-4 mb-4">
            {/* 螢幕外框 */}
            <div className="relative bg-gradient-to-b from-[#2A2520] to-[#1A1510] rounded-[16px] p-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
              {/* 螢幕 */}
              <div className="bg-[#1a2318] rounded-[12px] shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] p-4 min-h-[160px] relative overflow-hidden">
                {/* CRT 掃描線 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
                  }}
                />
                {/* 螢幕反光 */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                
                <InputScreen
                  mode={inputMode}
                  storeName={storeName}
                  category={category}
                  items={items}
                  currentItemName={currentItemName}
                  currentItemPrice={currentItemPrice}
                  currentItemQty={currentItemQty}
                  paymentMethod={paymentMethod}
                  printerState={printerState}
                  savedStoreNames={storeNames}
                  onStoreNameChange={setStoreName}
                  onCategoryChange={setCategory}
                  onItemNameChange={setCurrentItemName}
                  onItemPriceChange={setCurrentItemPrice}
                  onItemQtyChange={setCurrentItemQty}
                  onPaymentMethodChange={setPaymentMethod}
                  onAddItem={handleAddItem}
                  onModeChange={setInputMode}
                  onRemoveItem={(id) => setItems(items.filter((item) => item.id !== id))}
                />

                {/* 狀態列 */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2a3328]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-[5px] h-[5px] rounded-full bg-[#4ADE80] shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
                      <span className="font-mono text-[8px] text-[#4ADE80]/70">PWR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.div 
                        className={`w-[5px] h-[5px] rounded-full ${
                          printerState.status === "printing" 
                            ? "bg-[#FBBF24]" 
                            : "bg-[#4ADE80]"
                        }`}
                        style={{
                          boxShadow: printerState.status === "printing" 
                            ? "0 0 4px rgba(251,191,36,0.8)"
                            : "0 0 4px rgba(74,222,128,0.8)"
                        }}
                        animate={printerState.status === "printing" ? { opacity: [1, 0.3, 1] } : {}}
                        transition={{ duration: 0.3, repeat: Infinity }}
                      />
                      <span className={`font-mono text-[8px] ${
                        printerState.status === "printing" 
                          ? "text-[#FBBF24]/70" 
                          : "text-[#4ADE80]/70"
                      }`}>
                        {printerState.status === "ready" && "READY"}
                        {printerState.status === "printing" && "BUSY"}
                        {printerState.status === "done" && "DONE"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* AI 設定按鈕 */}
                    {onShowSettings && (
                      <button
                        onClick={onShowSettings}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#4ADE80]/10 transition-colors group"
                      >
                        <div className={`w-[5px] h-[5px] rounded-full ${isAIConfigured ? 'bg-[#4ADE80]' : 'bg-[#4ADE80]/30'}`} 
                          style={{ boxShadow: isAIConfigured ? '0 0 4px rgba(74,222,128,0.8)' : 'none' }} 
                        />
                        <span className="font-mono text-[8px] text-[#4ADE80]/50 group-hover:text-[#4ADE80]/80 transition-colors">AI</span>
                        <svg className="w-2.5 h-2.5 text-[#4ADE80]/50 group-hover:text-[#4ADE80]/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                    <span className="font-mono text-[8px] text-[#4ADE80]/50">v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 按鍵區域 */}
          <div className="flex items-center justify-center gap-3 px-4">
            {/* 相機掃描 */}
            {onShowCameraScan && (
              <RetroKey onClick={onShowCameraScan}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </RetroKey>
            )}

            {/* 成就系統 */}
            <RetroKey onClick={onShowAchievements} className="relative">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="14" r="6" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3L12 8L15 3M9 3V1M15 3V1" />
              </svg>
              {unreadAchievements > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadAchievements}
                </span>
              )}
            </RetroKey>

            {/* PRINT 按鈕 */}
            <RetroKey 
              onClick={handlePrint} 
              disabled={printerState.status === "printing" || showReceipt}
              size="large"
              variant="accent"
            >
              <span className="text-xs">PRINT</span>
            </RetroKey>

            {/* 圖表統計 */}
            <RetroKey onClick={onShowChart}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </RetroKey>

            {/* 查看存檔 */}
            <RetroKey onClick={onShowArchive}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </RetroKey>
          </div>

          {/* 底部裝飾 */}
          <div className="flex items-center justify-center mt-4 gap-2">
            <div className="w-6 h-[2px] bg-gradient-to-r from-transparent to-[#FFD700]/30 rounded-full" />
            <span className="font-mono text-[8px] text-[#FFD700]/60 tracking-[0.15em]">RT-02</span>
            <div className="w-6 h-[2px] bg-gradient-to-l from-transparent to-[#FFD700]/30 rounded-full" />
          </div>
        </div>

        {/* 側邊裝飾條 */}
        <div className="absolute left-0 top-16 bottom-8 w-2 bg-gradient-to-b from-[#D42040] via-[#A01830] to-[#D42040] rounded-r-sm shadow-inner" />
        <div className="absolute right-0 top-16 bottom-8 w-2 bg-gradient-to-b from-[#D42040] via-[#A01830] to-[#D42040] rounded-l-sm shadow-inner" />
      </div>

      {/* DEBUG 按鈕 */}
      {/* <button
        onClick={handleDebugPrint}
        className="mt-4 px-4 py-2 bg-gray-800 text-white text-xs font-mono rounded-lg hover:bg-gray-700 transition-colors opacity-50 hover:opacity-100"
      >
        🔧 DEBUG: 重跑動畫
      </button> */}
    </div>
  );
}
