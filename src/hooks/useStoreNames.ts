"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_STORAGE_KEY = "receipt-tracker-store-names";
const MAX_STORES = 20; // 最多儲存 20 個商店名稱

export function useStoreNames() {
  const { user } = useAuth();
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 監聯商店名稱變化
  useEffect(() => {
    if (!user) {
      // 未登入時從 localStorage 讀取
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setStoreNames(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load store names from localStorage:", error);
      }
      setIsLoaded(true);
      return;
    }

    // 已登入時從 Firestore 即時同步
    const storeNamesRef = doc(db, "users", user.uid, "settings", "storeNames");

    const unsubscribe = onSnapshot(
      storeNamesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.names && Array.isArray(data.names)) {
            setStoreNames(data.names);
          }
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching store names:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 儲存商店名稱
  const saveStoreName = useCallback(
    async (name: string) => {
      if (!name.trim()) return;

      const updateNames = (prev: string[]) => {
        // 移除重複的（不區分大小寫）
        const filtered = prev.filter(
          (s) => s.toLowerCase() !== name.trim().toLowerCase()
        );
        // 新的放在最前面
        return [name.trim(), ...filtered].slice(0, MAX_STORES);
      };

      if (!user) {
        // 未登入時存到 localStorage
        setStoreNames((prev) => {
          const updated = updateNames(prev);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch (error) {
            console.error("Failed to save store names to localStorage:", error);
          }
          return updated;
        });
        return;
      }

      // 已登入時存到 Firestore
      try {
        const updated = updateNames(storeNames);
        const storeNamesRef = doc(db, "users", user.uid, "settings", "storeNames");
        await setDoc(storeNamesRef, { names: updated });
      } catch (error) {
        console.error("Failed to save store name:", error);
        throw error;
      }
    },
    [user, storeNames]
  );

  // 刪除商店名稱
  const removeStoreName = useCallback(
    async (name: string) => {
      if (!user) {
        // 未登入時從 localStorage 刪除
        setStoreNames((prev) => {
          const updated = prev.filter((s) => s !== name);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch (error) {
            console.error("Failed to save store names to localStorage:", error);
          }
          return updated;
        });
        return;
      }

      // 已登入時從 Firestore 刪除
      try {
        const updated = storeNames.filter((s) => s !== name);
        const storeNamesRef = doc(db, "users", user.uid, "settings", "storeNames");
        await setDoc(storeNamesRef, { names: updated });
      } catch (error) {
        console.error("Failed to remove store name:", error);
        throw error;
      }
    },
    [user, storeNames]
  );

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
    isLoaded,
    saveStoreName,
    removeStoreName,
    searchStores,
  };
}
