"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt, Achievement, AchievementNotification } from "@/types";
import { ACHIEVEMENT_DEFINITIONS } from "@/utils/achievements";
import { trackAchievementUnlocked } from "@/utils/analytics";

const LOCAL_STORAGE_KEY = "achievements";
const LOCAL_NOTIFICATIONS_KEY = "achievement-notifications";

export function useAchievements(receipts: Receipt[]) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化成就列表
  const initializeAchievements = useCallback((): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      current: 0,
      unlocked: false,
    }));
  }, []);

  // 載入成就資料
  useEffect(() => {
    if (!user) {
      // 未登入時從 localStorage 讀取
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const storedNotifications = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);

        if (stored) {
          setAchievements(JSON.parse(stored));
        } else {
          setAchievements(initializeAchievements());
        }

        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error("Failed to load achievements from localStorage:", error);
        setAchievements(initializeAchievements());
      }
      setIsLoaded(true);
      return;
    }

    // 已登入時從 Firestore 即時同步
    const achievementsRef = collection(db, "users", user.uid, "achievements");
    const q = query(achievementsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // 沒有資料時初始化
          setAchievements(initializeAchievements());
        } else {
          const data: Achievement[] = [];
          snapshot.forEach((doc) => {
            data.push(doc.data() as Achievement);
          });
          setAchievements(data);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching achievements:", error);
        setAchievements(initializeAchievements());
        setIsLoaded(true);
      }
    );

    // 也載入通知
    const notificationsRef = doc(db, "users", user.uid, "settings", "notifications");
    const unsubNotifications = onSnapshot(
      notificationsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.achievements && Array.isArray(data.achievements)) {
            setNotifications(data.achievements);
          }
        }
      },
      (error) => {
        console.error("Error fetching notifications:", error);
      }
    );

    return () => {
      unsubscribe();
      unsubNotifications();
    };
  }, [user, initializeAchievements]);

  // 計算連續記帳天數
  const calculateStreak = (receipts: Receipt[]): number => {
    if (receipts.length === 0) return 0;

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

    const latestDate = new Date(sortedDates[0]);
    latestDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      return 0;
    }

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
      const [, month, year] = receipt.date.split("/");
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

  // 儲存成就到 Firestore 或 localStorage
  const saveAchievements = useCallback(
    async (updatedAchievements: Achievement[]) => {
      if (!user) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAchievements));
        } catch (error) {
          console.error("Failed to save achievements to localStorage:", error);
        }
        return;
      }

      try {
        const promises = updatedAchievements.map((achievement) => {
          const achievementRef = doc(db, "users", user.uid, "achievements", achievement.id);
          return setDoc(achievementRef, achievement);
        });
        await Promise.all(promises);
      } catch (error) {
        console.error("Failed to save achievements:", error);
      }
    },
    [user]
  );

  // 儲存通知到 Firestore 或 localStorage
  const saveNotifications = useCallback(
    async (updatedNotifications: AchievementNotification[]) => {
      if (!user) {
        try {
          localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
        } catch (error) {
          console.error("Failed to save notifications to localStorage:", error);
        }
        return;
      }

      try {
        const notificationsRef = doc(db, "users", user.uid, "settings", "notifications");
        await setDoc(notificationsRef, { achievements: updatedNotifications });
      } catch (error) {
        console.error("Failed to save notifications:", error);
      }
    },
    [user]
  );

  // 更新成就進度並檢查解鎖
  useEffect(() => {
    if (!isLoaded || receipts.length === 0) return;

    const streak = calculateStreak(receipts);
    const totalCount = receipts.length;
    const { thisMonth, lastMonth } = calculateMonthlySavings(receipts);
    const categoryCounts = calculateCategoryCount(receipts);

    const newNotifications: AchievementNotification[] = [];

    const updatedAchievements: Achievement[] = achievements.map((achievement) => {
      let current = achievement.current;

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

      const shouldUnlock = current >= achievement.requirement;
      const wasUnlocked = achievement.unlocked;

      if (shouldUnlock && !wasUnlocked) {
        // 追蹤成就解鎖
        trackAchievementUnlocked({
          achievement_id: achievement.id,
          achievement_type: achievement.type,
          achievement_title: achievement.title,
        });

        newNotifications.push({
          achievement: {
            ...achievement,
            current,
            unlocked: true,
            unlockedAt: Date.now(),
          },
          timestamp: Date.now(),
          isRead: false,
        });

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

    // 只有在有變化時才更新
    const hasChanges = JSON.stringify(updatedAchievements) !== JSON.stringify(achievements);
    if (hasChanges) {
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
    }

    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        const updated = [...prev, ...newNotifications];
        saveNotifications(updated);
        return updated;
      });
    }
  }, [receipts, isLoaded, achievements, saveAchievements, saveNotifications]);

  // 標記通知為已讀
  const markNotificationAsRead = useCallback(
    (timestamp: number) => {
      setNotifications((prev) => {
        const updated = prev.map((notif) =>
          notif.timestamp === timestamp ? { ...notif, isRead: true } : notif
        );
        saveNotifications(updated);
        return updated;
      });
    },
    [saveNotifications]
  );

  // 清除所有已讀通知
  const clearReadNotifications = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => !notif.isRead);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

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
