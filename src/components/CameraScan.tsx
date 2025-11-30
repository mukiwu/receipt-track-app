"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIReceipt } from "@/hooks/useAIReceipt";
import { AISettings, AIReceiptResult, ReceiptCategory, CATEGORY_INFO, AI_PROVIDER_INFO } from "@/types";

interface CameraScanProps {
  onReceiptScanned: (result: AIReceiptResult) => void;
  onClose: () => void;
  aiSettings: AISettings;
  onOpenSettings: () => void;
}

export default function CameraScan({
  onReceiptScanned,
  onClose,
  aiSettings,
  onOpenSettings,
}: CameraScanProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptResult, setReceiptResult] = useState<AIReceiptResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeReceipt, isProcessing, error } = useAIReceipt();

  const isConfigured = Boolean(aiSettings.apiKey);

  // 處理文件選擇
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 顯示預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);

      // 如果已配置 AI，自動開始分析
      if (isConfigured) {
        try {
          const result = await analyzeReceipt(file, aiSettings);
          setReceiptResult(result);
          setIsEditing(true);
        } catch (err) {
          console.error("AI analysis failed:", err);
        }
      }
    },
    [analyzeReceipt, aiSettings, isConfigured]
  );

  // 手動觸發分析
  const handleAnalyze = async () => {
    if (!selectedFile || !isConfigured) return;
    
    try {
      const result = await analyzeReceipt(selectedFile, aiSettings);
      setReceiptResult(result);
      setIsEditing(true);
    } catch (err) {
      console.error("AI analysis failed:", err);
    }
  };

  // 更新收據結果的欄位
  const updateResult = (field: keyof AIReceiptResult, value: unknown) => {
    if (!receiptResult) return;
    setReceiptResult({ ...receiptResult, [field]: value });
  };

  // 更新品項
  const updateItem = (index: number, field: string, value: string | number) => {
    if (!receiptResult) return;
    const newItems = [...receiptResult.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceiptResult({ ...receiptResult, items: newItems });
  };

  // 刪除品項
  const removeItem = (index: number) => {
    if (!receiptResult) return;
    const newItems = receiptResult.items.filter((_, i) => i !== index);
    setReceiptResult({ ...receiptResult, items: newItems });
  };

  // 新增品項
  const addItem = () => {
    if (!receiptResult) return;
    setReceiptResult({
      ...receiptResult,
      items: [...receiptResult.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  // 確認並返回結果
  const handleConfirm = () => {
    if (receiptResult) {
      // 重新計算總金額
      const total = receiptResult.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      onReceiptScanned({ ...receiptResult, total });
      onClose();
    }
  };

  // 重新掃描
  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setReceiptResult(null);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1f1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#4ADE80]/20"
      >
        {/* 標題列 */}
        <div className="bg-gradient-to-r from-[#1a2f1a] to-[#1a1f1a] px-6 py-4 flex items-center justify-between border-b border-[#4ADE80]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#4ADE80]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-mono text-[#4ADE80] font-bold">AI 收據掃描</h2>
              {isConfigured && (
                <p className="font-mono text-[10px] text-[#4ADE80]/50">
                  使用 {AI_PROVIDER_INFO[aiSettings.provider].name} 辨識
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4ADE80]/60 hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* 未配置 AI 提示 */}
          {!isConfigured && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4ADE80]/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#4ADE80]/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-mono text-[#4ADE80] font-bold mb-2">
                尚未配置 AI
              </h3>
              <p className="font-mono text-sm text-[#4ADE80]/60 mb-4">
                請先設定 AI 服務以啟用收據辨識功能
              </p>
              <button
                onClick={onOpenSettings}
                className="px-6 py-2 bg-[#4ADE80] text-[#0d120d] font-mono font-bold rounded-lg hover:bg-[#6EE7A0] transition-colors"
              >
                前往設定
              </button>
            </div>
          )}

          {/* 已配置 AI */}
          {isConfigured && (
            <>
              {/* 上傳按鈕 */}
              {!selectedImage && (
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl p-8 border-2 border-dashed border-[#4ADE80]/30 hover:border-[#4ADE80]/60 hover:bg-[#4ADE80]/5 transition-all"
                  >
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-[#4ADE80]/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="font-mono text-[#4ADE80] font-bold mb-2">
                      點擊拍照或選擇圖片
                    </p>
                    <p className="font-mono text-xs text-[#4ADE80]/50">
                      支援 JPG、PNG 格式
                    </p>
                  </button>
                </div>
              )}

              {/* 圖片預覽與結果 */}
              {selectedImage && (
                <div className="space-y-4">
                  {/* 圖片預覽 */}
                  <div className="rounded-xl overflow-hidden border border-[#4ADE80]/20">
                    <img
                      src={selectedImage}
                      alt="收據預覽"
                      className="w-full h-auto max-h-48 object-contain bg-black/20"
                    />
                  </div>

                  {/* AI 處理中 */}
                  {isProcessing && (
                    <div className="rounded-xl p-6 bg-[#4ADE80]/5 border border-[#4ADE80]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-[#4ADE80] border-t-transparent rounded-full"
                        />
                        <p className="font-mono text-sm text-[#4ADE80]">
                          AI 正在分析收據...
                        </p>
                      </div>
                      <div className="h-1 bg-[#4ADE80]/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-full bg-[#4ADE80]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 錯誤訊息 */}
                  {error && (
                    <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30">
                      <p className="font-mono text-sm text-red-400">⚠️ {error}</p>
                      <button
                        onClick={handleAnalyze}
                        className="mt-2 font-mono text-xs text-red-400 underline hover:text-red-300"
                      >
                        重新分析
                      </button>
                    </div>
                  )}

                  {/* 辨識結果編輯 */}
                  {isEditing && receiptResult && !isProcessing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-[#4ADE80] font-bold text-sm">
                          辨識結果
                        </h3>
                        <span className="font-mono text-[10px] text-[#4ADE80]/50">
                          可編輯修正
                        </span>
                      </div>

                      {/* 商店名稱 */}
                      <div className="space-y-1">
                        <label className="font-mono text-xs text-[#4ADE80]/60">
                          商店名稱
                        </label>
                        <input
                          type="text"
                          value={receiptResult.storeName}
                          onChange={(e) => updateResult("storeName", e.target.value)}
                          className="w-full px-3 py-2 bg-[#0d120d] border border-[#4ADE80]/30 rounded-lg font-mono text-sm text-[#4ADE80] focus:outline-none focus:border-[#4ADE80]"
                        />
                      </div>

                      {/* 類別 */}
                      <div className="space-y-1">
                        <label className="font-mono text-xs text-[#4ADE80]/60">
                          類別
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(Object.keys(CATEGORY_INFO) as ReceiptCategory[]).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => updateResult("category", cat)}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                                receiptResult.category === cat
                                  ? "bg-[#4ADE80]/20 border border-[#4ADE80]/60"
                                  : "border border-[#4ADE80]/20 hover:border-[#4ADE80]/40 text-[#4ADE80]/70"
                              }`}
                              style={{
                                color: receiptResult.category === cat ? CATEGORY_INFO[cat].color : undefined,
                              }}
                            >
                              {CATEGORY_INFO[cat].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 品項列表 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-xs text-[#4ADE80]/60">
                            品項
                          </label>
                          <button
                            onClick={addItem}
                            className="font-mono text-[10px] text-[#4ADE80] hover:text-[#6EE7A0]"
                          >
                            + 新增品項
                          </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          <AnimatePresence>
                            {receiptResult.items.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 p-2 bg-[#0d120d] rounded-lg border border-[#4ADE80]/20"
                              >
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateItem(index, "name", e.target.value)}
                                  placeholder="品名"
                                  className="flex-1 min-w-0 px-2 py-1 bg-transparent border-none font-mono text-xs text-[#4ADE80] focus:outline-none placeholder:text-[#4ADE80]/30"
                                />
                                <span className="text-[#4ADE80]/40 text-xs">×</span>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value) || 1)}
                                  className="w-10 px-1 py-1 bg-transparent border-none font-mono text-xs text-[#4ADE80] text-center focus:outline-none"
                                  min="1"
                                />
                                <span className="text-[#4ADE80]/40 text-xs">$</span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateItem(index, "price", Number(e.target.value) || 0)}
                                  className="w-16 px-1 py-1 bg-transparent border-none font-mono text-xs text-[#4ADE80] text-right focus:outline-none"
                                />
                                <button
                                  onClick={() => removeItem(index)}
                                  className="text-red-400/60 hover:text-red-400 p-1"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* 付款方式 */}
                      <div className="space-y-1">
                        <label className="font-mono text-xs text-[#4ADE80]/60">
                          付款方式
                        </label>
                        <div className="flex gap-2">
                          {["現金", "信用卡"].map((method) => (
                            <button
                              key={method}
                              onClick={() => updateResult("paymentMethod", method)}
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                                receiptResult.paymentMethod === method
                                  ? "bg-[#4ADE80]/20 border border-[#4ADE80]/60 text-[#4ADE80]"
                                  : "border border-[#4ADE80]/20 text-[#4ADE80]/50 hover:border-[#4ADE80]/40"
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 總金額 */}
                      <div className="flex items-center justify-between p-3 bg-[#4ADE80]/10 rounded-lg">
                        <span className="font-mono text-sm text-[#4ADE80]">總金額</span>
                        <span className="font-mono text-lg font-bold text-[#4ADE80]">
                          ${receiptResult.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t border-[#4ADE80]/20 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-sm text-[#4ADE80]/60 hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-lg transition-colors"
          >
            取消
          </button>
          {selectedImage && !isProcessing && isConfigured && (
            <button
              onClick={handleReset}
              className="px-4 py-2 font-mono text-sm text-[#4ADE80]/80 hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-lg transition-colors"
            >
              重新掃描
            </button>
          )}
          {isEditing && receiptResult && !isProcessing && (
            <button
              onClick={handleConfirm}
              className="px-6 py-2 font-mono text-sm bg-[#4ADE80] text-[#0d120d] rounded-lg hover:bg-[#6EE7A0] transition-colors font-bold"
            >
              確認使用
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
