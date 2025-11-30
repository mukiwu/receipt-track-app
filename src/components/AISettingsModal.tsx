"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AISettings, AIProvider, AI_MODELS, AI_PROVIDER_INFO } from "@/types";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export default function AISettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: AISettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);

  // 當外部設定改變時更新本地設定
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // 處理提供商變更
  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = AI_MODELS[provider][0].id;
    setLocalSettings({
      ...localSettings,
      provider,
      model: defaultModel,
    });
  };

  // 處理儲存
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  // 取得 API Key 輸入提示
  const getApiKeyPlaceholder = (provider: AIProvider) => {
    switch (provider) {
      case "openai":
        return "sk-...";
      case "anthropic":
        return "sk-ant-...";
      case "google":
        return "AIza...";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* 彈窗內容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#1a1f1a] rounded-2xl shadow-2xl border border-[#4ADE80]/20 overflow-hidden"
          >
            {/* 標題列 */}
            <div className="px-6 py-4 border-b border-[#4ADE80]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/20 flex items-center justify-center">
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-mono text-[#4ADE80] font-bold text-lg">
                    AI 設定
                  </h2>
                  <p className="font-mono text-[#4ADE80]/50 text-xs">
                    配置收據辨識 AI
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#4ADE80]/60 hover:text-[#4ADE80] transition-colors p-2 rounded-lg hover:bg-[#4ADE80]/10"
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
            <div className="p-6 space-y-5">
              {/* AI 提供商選擇 */}
              <div className="space-y-2">
                <label className="block font-mono text-[#4ADE80]/80 text-sm">
                  AI 提供商
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(AI_PROVIDER_INFO) as AIProvider[]).map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`p-3 rounded-lg border transition-all font-mono text-xs ${
                        localSettings.provider === provider
                          ? "border-[#4ADE80] bg-[#4ADE80]/10 text-[#4ADE80]"
                          : "border-[#4ADE80]/20 text-[#4ADE80]/50 hover:border-[#4ADE80]/40 hover:text-[#4ADE80]/80"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: AI_PROVIDER_INFO[provider].color }}
                      />
                      {AI_PROVIDER_INFO[provider].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 模型選擇 */}
              <div className="space-y-2">
                <label className="block font-mono text-[#4ADE80]/80 text-sm">
                  模型
                </label>
                <select
                  value={localSettings.model}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, model: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0d120d] border border-[#4ADE80]/30 rounded-lg font-mono text-sm text-[#4ADE80] focus:outline-none focus:border-[#4ADE80] transition-colors"
                >
                  {AI_MODELS[localSettings.provider].map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key 輸入 */}
              <div className="space-y-2">
                <label className="block font-mono text-[#4ADE80]/80 text-sm">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={localSettings.apiKey}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, apiKey: e.target.value })
                    }
                    placeholder={getApiKeyPlaceholder(localSettings.provider)}
                    className="w-full px-4 py-3 pr-12 bg-[#0d120d] border border-[#4ADE80]/30 rounded-lg font-mono text-sm text-[#4ADE80] placeholder:text-[#4ADE80]/30 focus:outline-none focus:border-[#4ADE80] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4ADE80]/50 hover:text-[#4ADE80] transition-colors"
                  >
                    {showApiKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[10px] text-[#4ADE80]/40">
                  💡 API Key 只會儲存在您的瀏覽器中，不會上傳到任何伺服器
                </p>
              </div>

              {/* 狀態提示 */}
              {localSettings.apiKey && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#4ADE80]/10 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <span className="font-mono text-xs text-[#4ADE80]">
                    已配置 {AI_PROVIDER_INFO[localSettings.provider].name}
                  </span>
                </div>
              )}
            </div>

            {/* 底部按鈕 */}
            <div className="px-6 py-4 border-t border-[#4ADE80]/20 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 font-mono text-sm text-[#4ADE80]/60 hover:text-[#4ADE80] hover:bg-[#4ADE80]/10 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!localSettings.apiKey}
                className="px-6 py-2 font-mono text-sm bg-[#4ADE80] text-[#0d120d] rounded-lg hover:bg-[#6EE7A0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                儲存設定
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

