"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt } from "@/types";

const LOCAL_STORAGE_KEY = "thermal-receipts";

export function useReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 監聽 Firestore 資料變化
  useEffect(() => {
    if (!user) {
      // 未登入時從 localStorage 載入（向後兼容）
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setReceipts(parsed.sort((a: Receipt, b: Receipt) => b.createdAt - a.createdAt));
        }
      } catch (error) {
        console.error("Failed to load receipts from localStorage:", error);
      }
      setIsLoaded(true);
      return;
    }

    // 已登入時從 Firestore 即時同步
    const receiptsRef = collection(db, "users", user.uid, "receipts");
    const q = query(receiptsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Receipt[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Receipt);
        });
        setReceipts(data);
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching receipts:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 新增收據
  const addReceipt = useCallback(
    async (receipt: Receipt) => {
      if (!user) {
        // 未登入時存到 localStorage
        setReceipts((prev) => {
          const updated = [receipt, ...prev];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        return;
      }

      // 已登入時存到 Firestore
      try {
        const receiptRef = doc(db, "users", user.uid, "receipts", receipt.id);
        await setDoc(receiptRef, {
          ...receipt,
          // 確保 id 不重複存
          id: receipt.id,
        });
      } catch (error) {
        console.error("Failed to add receipt:", error);
        throw error;
      }
    },
    [user]
  );

  // 刪除收據
  const deleteReceipt = useCallback(
    async (id: string) => {
      if (!user) {
        // 未登入時從 localStorage 刪除
        setReceipts((prev) => {
          const updated = prev.filter((r) => r.id !== id);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        return;
      }

      // 已登入時從 Firestore 刪除
      try {
        const receiptRef = doc(db, "users", user.uid, "receipts", id);
        await deleteDoc(receiptRef);
      } catch (error) {
        console.error("Failed to delete receipt:", error);
        throw error;
      }
    },
    [user]
  );

  // 清除所有收據
  const clearAllReceipts = useCallback(async () => {
    if (!user) {
      setReceipts([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }

    // 已登入時從 Firestore 批量刪除
    try {
      const promises = receipts.map((r) => {
        const receiptRef = doc(db, "users", user.uid, "receipts", r.id);
        return deleteDoc(receiptRef);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to clear receipts:", error);
      throw error;
    }
  }, [user, receipts]);

  return {
    receipts,
    isLoaded,
    addReceipt,
    deleteReceipt,
    clearAllReceipts,
  };
}
