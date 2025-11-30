"use client";

import { useState, useEffect, useCallback } from "react";
import { AISettings, AIProvider, AI_MODELS } from "@/types";

const STORAGE_KEY = "receipt-tracker-ai-settings";

const DEFAULT_SETTINGS: AISettings = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "",
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 從 localStorage 讀取設定
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AISettings;
        // 驗證設定的有效性
        if (isValidSettings(parsed)) {
          setSettings(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    }
    setIsLoaded(true);
  }, []);

  // 驗證設定是否有效
  const isValidSettings = (s: AISettings): boolean => {
    const validProviders: AIProvider[] = ["openai", "anthropic", "google"];
    if (!validProviders.includes(s.provider)) return false;
    
    const providerModels = AI_MODELS[s.provider];
    if (!providerModels.some((m) => m.id === s.model)) return false;
    
    return true;
  };

  // 儲存設定到 localStorage
  const saveSettings = useCallback((newSettings: AISettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save AI settings:", error);
    }
  }, []);

  // 更新提供商（同時更新為該提供商的預設模型）
  const updateProvider = useCallback((provider: AIProvider) => {
    const defaultModel = AI_MODELS[provider][0].id;
    saveSettings({
      ...settings,
      provider,
      model: defaultModel,
    });
  }, [settings, saveSettings]);

  // 更新模型
  const updateModel = useCallback((model: string) => {
    saveSettings({
      ...settings,
      model,
    });
  }, [settings, saveSettings]);

  // 更新 API Key
  const updateApiKey = useCallback((apiKey: string) => {
    saveSettings({
      ...settings,
      apiKey,
    });
  }, [settings, saveSettings]);

  // 清除設定
  const clearSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Failed to clear AI settings:", error);
    }
  }, []);

  // 檢查是否已配置 API Key
  const isConfigured = Boolean(settings.apiKey);

  return {
    settings,
    isLoaded,
    isConfigured,
    saveSettings,
    updateProvider,
    updateModel,
    updateApiKey,
    clearSettings,
  };
}


