"use client";

import { useState, useEffect } from "react";
import { Receipt } from "@/types";
import { generateMockReceipts } from "@/utils/generateMockData";

const STORAGE_KEY = "thermal-receipts";

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 從 localStorage 載入資料
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 按創建時間降序排列
        setReceipts(parsed.sort((a: Receipt, b: Receipt) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error("Failed to load receipts:", error);
    }
    setIsLoaded(true);
  }, []);

  // 儲存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
      } catch (error) {
        console.error("Failed to save receipts:", error);
      }
    }
  }, [receipts, isLoaded]);

  const addReceipt = (receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAllReceipts = () => {
    setReceipts([]);
  };

  const loadMockData = () => {
    const mockReceipts = generateMockReceipts(30);
    setReceipts(mockReceipts);
  };

  return {
    receipts,
    isLoaded,
    addReceipt,
    deleteReceipt,
    clearAllReceipts,
    loadMockData,
  };
}

