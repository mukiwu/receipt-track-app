"use client";

import { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type PlanType = "free" | "pro";

export interface Subscription {
  plan: PlanType;
  // Stripe 相關欄位（未來使用）
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
  status?: "active" | "canceled" | "past_due" | "trialing";
  // 額度追蹤
  receiptCountThisMonth: number;
  aiScanCountThisMonth: number;
  lastResetDate: string; // YYYY-MM 格式
}

// 免費版限制
const FREE_LIMITS = {
  receiptsPerMonth: 30,
  aiScansPerMonth: 10,
};

// 預設訂閱狀態
const defaultSubscription: Subscription = {
  plan: "free",
  receiptCountThisMonth: 0,
  aiScanCountThisMonth: 0,
  lastResetDate: "",
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);
  const [isLoaded, setIsLoaded] = useState(false);

  // 取得當前月份 YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  // 監聽訂閱狀態
  useEffect(() => {
    if (!user) {
      setSubscription(defaultSubscription);
      setIsLoaded(true);
      return;
    }

    const subscriptionRef = doc(db, "users", user.uid, "settings", "subscription");
    
    const unsubscribe = onSnapshot(
      subscriptionRef,
      (snapshot) => {
        const currentMonth = getCurrentMonth();
        
        if (snapshot.exists()) {
          const data = snapshot.data() as Subscription;
          
          // 檢查是否需要重置月度計數
          if (data.lastResetDate !== currentMonth) {
            const resetData: Subscription = {
              ...data,
              receiptCountThisMonth: 0,
              aiScanCountThisMonth: 0,
              lastResetDate: currentMonth,
            };
            setDoc(subscriptionRef, resetData);
            setSubscription(resetData);
          } else {
            setSubscription(data);
          }
        } else {
          // 建立預設訂閱
          const newSubscription: Subscription = {
            ...defaultSubscription,
            lastResetDate: currentMonth,
          };
          setDoc(subscriptionRef, newSubscription);
          setSubscription(newSubscription);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("訂閱狀態載入失敗:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 是否為 Pro 用戶
  const isPro = useMemo(() => {
    return subscription.plan === "pro" && subscription.status === "active";
  }, [subscription.plan, subscription.status]);

  // 檢查收據額度
  const canAddReceipt = useMemo(() => {
    if (isPro) return true;
    return subscription.receiptCountThisMonth < FREE_LIMITS.receiptsPerMonth;
  }, [isPro, subscription.receiptCountThisMonth]);

  // 檢查 AI 掃描額度
  const canUseAIScan = useMemo(() => {
    if (isPro) return true;
    return subscription.aiScanCountThisMonth < FREE_LIMITS.aiScansPerMonth;
  }, [isPro, subscription.aiScanCountThisMonth]);

  // 剩餘收據額度
  const remainingReceipts = useMemo(() => {
    if (isPro) return Infinity;
    return Math.max(0, FREE_LIMITS.receiptsPerMonth - subscription.receiptCountThisMonth);
  }, [isPro, subscription.receiptCountThisMonth]);

  // 剩餘 AI 掃描額度
  const remainingAIScans = useMemo(() => {
    if (isPro) return Infinity;
    return Math.max(0, FREE_LIMITS.aiScansPerMonth - subscription.aiScanCountThisMonth);
  }, [isPro, subscription.aiScanCountThisMonth]);

  // 增加收據計數
  const incrementReceiptCount = async () => {
    if (!user) return;
    
    const subscriptionRef = doc(db, "users", user.uid, "settings", "subscription");
    await setDoc(subscriptionRef, {
      ...subscription,
      receiptCountThisMonth: subscription.receiptCountThisMonth + 1,
    }, { merge: true });
  };

  // 增加 AI 掃描計數
  const incrementAIScanCount = async () => {
    if (!user) return;
    
    const subscriptionRef = doc(db, "users", user.uid, "settings", "subscription");
    await setDoc(subscriptionRef, {
      ...subscription,
      aiScanCountThisMonth: subscription.aiScanCountThisMonth + 1,
    }, { merge: true });
  };

  // 升級到 Pro（暫時用手動設定，之後接 Stripe）
  const upgradeToPro = async () => {
    if (!user) return;
    
    const subscriptionRef = doc(db, "users", user.uid, "settings", "subscription");
    await setDoc(subscriptionRef, {
      ...subscription,
      plan: "pro",
      status: "active",
    }, { merge: true });
  };

  return {
    subscription,
    isLoaded,
    isPro,
    canAddReceipt,
    canUseAIScan,
    remainingReceipts,
    remainingAIScans,
    incrementReceiptCount,
    incrementAIScanCount,
    upgradeToPro,
    limits: FREE_LIMITS,
  };
}

