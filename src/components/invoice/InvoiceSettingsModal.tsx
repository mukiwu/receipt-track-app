"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvoiceSettings } from "@/hooks/useInvoiceSettings";
import { CarrierType } from "@/types/invoice";

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CARRIER_TYPES: { id: CarrierType; label: string; placeholder: string; hint: string }[] = [
  {
    id: "phone",
    label: "手機條碼",
    placeholder: "/ABC1234",
    hint: "格式：/ 開頭 + 7 碼英數字",
  },
  {
    id: "natural",
    label: "自然人憑證",
    placeholder: "AB12345678901234",
    hint: "格式：2 碼英文 + 14 碼數字",
  },
];

export default function InvoiceSettingsModal({
  isOpen,
  onClose,
}: InvoiceSettingsModalProps) {
  const { settings, saveSettings, isConfigured } = useInvoiceSettings();
  
  const [carrierType, setCarrierType] = useState<CarrierType>("phone");
  const [carrierNumber, setCarrierNumber] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // 初始化表單
  useEffect(() => {
    if (isOpen && settings) {
      setCarrierType(settings.carrierType);
      setCarrierNumber(settings.carrierNumber);
      setVerifyCode(settings.verifyCode);
      setAutoSync(settings.autoSync);
      setError("");
    }
  }, [isOpen, settings]);

  // 驗證載具格式
  const validateCarrier = (): boolean => {
    if (!carrierNumber.trim()) {
      setError("請輸入載具號碼");
      return false;
    }

    if (carrierType === "phone") {
      // 手機條碼格式：/ABC1234
      const phonePattern = /^\/[A-Z0-9+.\-]{7}$/;
      if (!phonePattern.test(carrierNumber.toUpperCase())) {
        setError("手機條碼格式錯誤，請輸入 / 開頭 + 7 碼英數字");
        return false;
      }
    } else if (carrierType === "natural") {
      // 自然人憑證格式
      const naturalPattern = /^[A-Z]{2}\d{14}$/;
      if (!naturalPattern.test(carrierNumber.toUpperCase())) {
        setError("自然人憑證格式錯誤");
        return false;
      }
    }

    if (!verifyCode.trim()) {
      setError("請輸入驗證碼");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateCarrier()) return;

    setIsSaving(true);
    setError("");

    try {
      await saveSettings({
        carrierType,
        carrierNumber: carrierNumber.toUpperCase(),
        verifyCode,
        autoSync,
      });
      onClose();
    } catch (err) {
      console.error("儲存發票設定失敗:", err);
      setError("儲存失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCarrierType = CARRIER_TYPES.find((c) => c.id === carrierType)!;

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
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* 頭部 */}
              <div className="bg-gradient-to-r from-[#C41E3A] to-[#9A1428] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
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
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">電子發票設定</h2>
                      <p className="text-white/70 text-xs">
                        {isConfigured ? "已設定載具" : "設定載具以同步發票"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 內容區 */}
              <div className="p-5 space-y-5">
                {/* 載具類型選擇 */}
                <div>
                  <label className="block font-mono text-sm font-medium text-gray-700 mb-2">
                    載具類型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARRIER_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCarrierType(type.id)}
                        className={`py-3 px-4 rounded-xl font-mono text-sm transition-all ${
                          carrierType === type.id
                            ? "bg-[#C41E3A] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 載具號碼 */}
                <div>
                  <label className="block font-mono text-sm font-medium text-gray-700 mb-2">
                    載具號碼
                  </label>
                  <input
                    type="text"
                    value={carrierNumber}
                    onChange={(e) => setCarrierNumber(e.target.value.toUpperCase())}
                    placeholder={selectedCarrierType.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedCarrierType.hint}
                  </p>
                </div>

                {/* 驗證碼 */}
                <div>
                  <label className="block font-mono text-sm font-medium text-gray-700 mb-2">
                    驗證碼
                  </label>
                  <input
                    type="password"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="財政部設定的驗證碼"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/50 focus:border-[#C41E3A]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    請至財政部電子發票整合服務平台設定
                  </p>
                </div>

                {/* 自動同步開關 */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-700">
                      自動同步發票
                    </p>
                    <p className="text-xs text-gray-500">每日自動匯入新發票</p>
                  </div>
                  <button
                    onClick={() => setAutoSync(!autoSync)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      autoSync ? "bg-[#C41E3A]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        autoSync ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* 說明文字 */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        如何取得手機條碼？
                      </p>
                      <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                        <li>前往財政部電子發票整合服務平台</li>
                        <li>申請手機條碼載具</li>
                        <li>設定驗證碼</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* 按鈕區 */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-mono font-medium hover:bg-gray-200 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#9A1428] text-white font-mono font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSaving ? "儲存中..." : "儲存設定"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

