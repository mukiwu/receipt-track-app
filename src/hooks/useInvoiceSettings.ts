"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceSettings, defaultInvoiceSettings } from "@/types/invoice";

export function useInvoiceSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<InvoiceSettings>(defaultInvoiceSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // 監聽設定變更
  useEffect(() => {
    if (!user) {
      setSettings(defaultInvoiceSettings);
      setIsLoaded(true);
      return;
    }

    const settingsRef = doc(db, "users", user.uid, "settings", "invoice");
    
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as InvoiceSettings);
        } else {
          // 建立預設設定
          setDoc(settingsRef, defaultInvoiceSettings);
          setSettings(defaultInvoiceSettings);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("發票設定載入失敗:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 儲存設定
  const saveSettings = async (newSettings: Partial<InvoiceSettings>) => {
    if (!user) return;

    const settingsRef = doc(db, "users", user.uid, "settings", "invoice");
    const updatedSettings = { ...settings, ...newSettings };
    
    await setDoc(settingsRef, updatedSettings);
  };

  // 更新同步狀態
  const updateSyncStatus = async (
    status: InvoiceSettings["syncStatus"],
    error?: string
  ) => {
    if (!user) return;

    const settingsRef = doc(db, "users", user.uid, "settings", "invoice");
    await setDoc(settingsRef, {
      ...settings,
      syncStatus: status,
      syncError: error,
      lastSyncAt: status === "success" ? Date.now() : settings.lastSyncAt,
    }, { merge: true });
  };

  // 檢查是否已設定載具
  const isConfigured = Boolean(settings.carrierNumber && settings.verifyCode);

  return {
    settings,
    isLoaded,
    isConfigured,
    saveSettings,
    updateSyncStatus,
  };
}

