"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AISettings, AIProvider, AI_MODELS } from "@/types";

const LOCAL_STORAGE_KEY = "receipt-tracker-ai-settings";

const DEFAULT_SETTINGS: AISettings = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "",
};

// 驗證設定是否有效
const isValidSettings = (s: AISettings): boolean => {
  const validProviders: AIProvider[] = ["openai", "anthropic", "google"];
  if (!validProviders.includes(s.provider)) return false;

  const providerModels = AI_MODELS[s.provider];
  if (!providerModels.some((m) => m.id === s.model)) return false;

  return true;
};

export function useAISettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 監聽設定變化
  useEffect(() => {
    if (!user) {
      // 未登入時從 localStorage 讀取
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AISettings;
          if (isValidSettings(parsed)) {
            setSettings(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load AI settings from localStorage:", error);
      }
      setIsLoaded(true);
      return;
    }

    // 已登入時從 Firestore 即時同步
    const settingsRef = doc(db, "users", user.uid, "settings", "ai");

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as AISettings;
          if (isValidSettings(data)) {
            setSettings(data);
          }
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching AI settings:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 儲存設定
  const saveSettings = useCallback(
    async (newSettings: AISettings) => {
      if (!user) {
        // 未登入時存到 localStorage
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
          setSettings(newSettings);
        } catch (error) {
          console.error("Failed to save AI settings to localStorage:", error);
        }
        return;
      }

      // 已登入時存到 Firestore
      try {
        const settingsRef = doc(db, "users", user.uid, "settings", "ai");
        await setDoc(settingsRef, newSettings);
      } catch (error) {
        console.error("Failed to save AI settings:", error);
        throw error;
      }
    },
    [user]
  );

  // 更新提供商（同時更新為該提供商的預設模型）
  const updateProvider = useCallback(
    (provider: AIProvider) => {
      const defaultModel = AI_MODELS[provider][0].id;
      saveSettings({
        ...settings,
        provider,
        model: defaultModel,
      });
    },
    [settings, saveSettings]
  );

  // 更新模型
  const updateModel = useCallback(
    (model: string) => {
      saveSettings({
        ...settings,
        model,
      });
    },
    [settings, saveSettings]
  );

  // 更新 API Key
  const updateApiKey = useCallback(
    (apiKey: string) => {
      saveSettings({
        ...settings,
        apiKey,
      });
    },
    [settings, saveSettings]
  );

  // 清除設定
  const clearSettings = useCallback(async () => {
    if (!user) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setSettings(DEFAULT_SETTINGS);
      } catch (error) {
        console.error("Failed to clear AI settings:", error);
      }
      return;
    }

    try {
      const settingsRef = doc(db, "users", user.uid, "settings", "ai");
      await deleteDoc(settingsRef);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Failed to clear AI settings:", error);
      throw error;
    }
  }, [user]);

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
