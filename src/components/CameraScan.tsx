"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOCR } from "@/hooks/useOCR";

interface CameraScanProps {
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

export default function CameraScan({ onTextExtracted, onClose }: CameraScanProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processImage, isProcessing, progress, error } = useOCR();

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

      // 執行 OCR
      try {
        const result = await processImage(file);
        setOcrText(result.text);
        setIsEditing(true);
      } catch (err) {
        console.error("OCR failed:", err);
      }
    },
    [processImage]
  );

  // 確認並返回文字
  const handleConfirm = () => {
    if (ocrText.trim()) {
      onTextExtracted(ocrText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* 標題列 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-white"
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
            <h2 className="font-mono text-white font-bold">收據掃描</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="receipt-paper rounded-lg px-8 py-12 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300"
              >
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
                <p className="font-mono text-gray-700 font-bold mb-2">點擊拍照或選擇圖片</p>
                <p className="font-mono text-xs text-gray-500">
                  支援 JPG、PNG 格式
                </p>
              </button>
            </div>
          )}

          {/* 圖片預覽 */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="receipt-paper rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="收據預覽"
                  className="w-full h-auto"
                />
              </div>

              {/* OCR 處理中 */}
              {isProcessing && (
                <div className="receipt-paper rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-mono text-sm text-gray-700">
                      正在辨識文字... {progress}%
                    </p>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 錯誤訊息 */}
              {error && (
                <div className="receipt-paper rounded-lg p-4 bg-red-50 border border-red-200">
                  <p className="font-mono text-sm text-red-600">⚠️ {error}</p>
                </div>
              )}

              {/* OCR 結果編輯 */}
              {isEditing && !isProcessing && (
                <div className="receipt-paper rounded-lg p-4">
                  <label className="block mb-2">
                    <span className="font-mono text-sm text-gray-700 font-bold">
                      辨識結果 (可編輯)
                    </span>
                  </label>
                  <textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    rows={10}
                    className="w-full font-mono text-sm p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請編輯或輸入收據內容..."
                  />
                  <p className="font-mono text-xs text-gray-500 mt-2">
                    💡 您可以修正辨識錯誤或補充缺失的資訊
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            取消
          </button>
          {selectedImage && !isProcessing && (
            <button
              onClick={() => {
                setSelectedImage(null);
                setOcrText("");
                setIsEditing(false);
              }}
              className="px-4 py-2 font-mono text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              重新掃描
            </button>
          )}
          {isEditing && !isProcessing && (
            <button
              onClick={handleConfirm}
              disabled={!ocrText.trim()}
              className="px-4 py-2 font-mono text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              確認使用
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
