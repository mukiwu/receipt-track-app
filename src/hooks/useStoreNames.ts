"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "receipt-tracker-store-names";
const MAX_STORES = 20; // 最多儲存 20 個商店名稱

export function useStoreNames() {
  const [storeNames, setStoreNames] = useState<string[]>([]);

  // 初始化：從 localStorage 讀取
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStoreNames(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load store names:", error);
    }
  }, []);

  // 儲存商店名稱
  const saveStoreName = useCallback((name: string) => {
    if (!name.trim()) return;
    
    setStoreNames((prev) => {
      // 移除重複的（不區分大小寫）
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== name.trim().toLowerCase()
      );
      // 新的放在最前面
      const updated = [name.trim(), ...filtered].slice(0, MAX_STORES);
      
      // 儲存到 localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save store names:", error);
      }
      
      return updated;
    });
  }, []);

  // 刪除商店名稱
  const removeStoreName = useCallback((name: string) => {
    setStoreNames((prev) => {
      const updated = prev.filter((s) => s !== name);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save store names:", error);
      }
      return updated;
    });
  }, []);

  // 搜尋匹配的商店名稱
  const searchStores = useCallback(
    (query: string): string[] => {
      if (!query.trim()) return storeNames.slice(0, 5); // 沒輸入時顯示最近 5 個
      
      const lowerQuery = query.toLowerCase();
      return storeNames
        .filter((s) => s.toLowerCase().includes(lowerQuery))
        .slice(0, 5);
    },
    [storeNames]
  );

  return {
    storeNames,
    saveStoreName,
    removeStoreName,
    searchStores,
  };
}



