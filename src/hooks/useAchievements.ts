"use client";

import { useState, useEffect, useMemo } from "react";
import { Receipt, Achievement, AchievementNotification } from "@/types";
import { ACHIEVEMENT_DEFINITIONS } from "@/utils/achievements";
import { trackAchievementUnlocked } from "@/utils/analytics";

const STORAGE_KEY = "achievements";
const NOTIFICATIONS_KEY = "achievement-notifications";

export function useAchievements(receipts: Receipt[]) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 從 localStorage 載入成就狀態
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);

      if (stored) {
        setAchievements(JSON.parse(stored));
      } else {
        // 初始化成就列表
        const initialAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => ({
          ...def,
          current: 0,
          unlocked: false,
        }));
        setAchievements(initialAchievements);
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }
    setIsLoaded(true);
  }, []);

  // 計算連續記帳天數
  const calculateStreak = (receipts: Receipt[]): number => {
    if (receipts.length === 0) return 0;

    // 將收據按日期分組
    const dateSet = new Set<string>();
    receipts.forEach((receipt) => {
      const [day, month, year] = receipt.date.split("/");
      const fullYear = `20${year}`;
      dateSet.add(`${fullYear}-${month}-${day}`);
    });

    const sortedDates = Array.from(dateSet).sort().reverse();

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 檢查最近一筆記錄是否是今天或昨天
    const latestDate = new Date(sortedDates[0]);
    latestDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      return 0; // 中斷了
    }

    // 計算連續天數
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // 計算本月和上月支出
  const calculateMonthlySavings = (receipts: Receipt[]): { thisMonth: number; lastMonth: number } => {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    receipts.forEach((receipt) => {
      const [day, month, year] = receipt.date.split("/");
      const fullYear = parseInt(`20${year}`);
      const monthNum = parseInt(month);

      if (fullYear === thisYear && monthNum === thisMonth) {
        thisMonthTotal += receipt.total;
      } else if (fullYear === lastMonthYear && monthNum === lastMonth) {
        lastMonthTotal += receipt.total;
      }
    });

    return { thisMonth: thisMonthTotal, lastMonth: lastMonthTotal };
  };

  // 計算各類別的收據數量
  const calculateCategoryCount = (receipts: Receipt[]) => {
    const counts: Record<string, number> = {};
    receipts.forEach((receipt) => {
      const category = receipt.category || "other";
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  };

  // 更新成就進度並檢查解鎖
  useEffect(() => {
    if (!isLoaded || receipts.length === 0) return;

    const streak = calculateStreak(receipts);
    const totalCount = receipts.length;
    const { thisMonth, lastMonth } = calculateMonthlySavings(receipts);
    const categoryCounts = calculateCategoryCount(receipts);

    const updatedAchievements: Achievement[] = achievements.map((achievement) => {
      let current = achievement.current;

      // 計算當前進度
      switch (achievement.type) {
        case "streak":
          current = streak;
          break;
        case "count":
          current = totalCount;
          break;
        case "saving":
          current = lastMonth > 0 && thisMonth < lastMonth ? 1 : 0;
          break;
        case "category":
          if (achievement.category) {
            current = categoryCounts[achievement.category] || 0;
          }
          break;
      }

      // 檢查是否達成
      const shouldUnlock = current >= achievement.requirement;
      const wasUnlocked = achievement.unlocked;

      if (shouldUnlock && !wasUnlocked) {
        // 新解鎖成就，加入通知
        const notification: AchievementNotification = {
          achievement: {
            ...achievement,
            current,
            unlocked: true,
            unlockedAt: Date.now(),
          },
          timestamp: Date.now(),
          isRead: false,
        };

        // 追蹤成就解鎖
        trackAchievementUnlocked({
          achievement_id: achievement.id,
          achievement_type: achievement.type,
          achievement_title: achievement.title,
        });

        setNotifications((prev) => [...prev, notification]);

        return {
          ...achievement,
          current,
          unlocked: true,
          unlockedAt: Date.now(),
        };
      }

      return {
        ...achievement,
        current,
      };
    });

    setAchievements(updatedAchievements);
  }, [receipts, isLoaded]);

  // 儲存成就狀態到 localStorage
  useEffect(() => {
    if (isLoaded && achievements.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
      } catch (error) {
        console.error("Failed to save achievements:", error);
      }
    }
  }, [achievements, isLoaded]);

  // 儲存通知到 localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      } catch (error) {
        console.error("Failed to save notifications:", error);
      }
    }
  }, [notifications, isLoaded]);

  // 標記通知為已讀
  const markNotificationAsRead = (timestamp: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.timestamp === timestamp ? { ...notif, isRead: true } : notif
      )
    );
  };

  // 清除所有已讀通知
  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((notif) => !notif.isRead));
  };

  // 未讀通知數量
  const unreadCount = useMemo(() => {
    return notifications.filter((notif) => !notif.isRead).length;
  }, [notifications]);

  // 已解鎖成就數量
  const unlockedCount = useMemo(() => {
    return achievements.filter((achievement) => achievement.unlocked).length;
  }, [achievements]);

  return {
    achievements,
    notifications,
    unreadCount,
    unlockedCount,
    isLoaded,
    markNotificationAsRead,
    clearReadNotifications,
  };
}
