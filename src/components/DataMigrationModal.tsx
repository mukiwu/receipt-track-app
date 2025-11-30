"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt, Achievement, AISettings } from "@/types";
import { trackEvent } from "@/utils/analytics";

const LOCAL_RECEIPTS_KEY = "thermal-receipts";
const LOCAL_ACHIEVEMENTS_KEY = "achievements";
const LOCAL_AI_SETTINGS_KEY = "receipt-tracker-ai-settings";
const LOCAL_STORE_NAMES_KEY = "receipt-tracker-store-names";
const MIGRATION_DONE_KEY = "migration-completed";

interface LocalData {
  receipts: Receipt[];
  achievements: Achievement[];
  aiSettings: AISettings | null;
  storeNames: string[];
}

export default function DataMigrationModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 檢查是否有本機資料且尚未遷移
  useEffect(() => {
    if (!user) return;

    // 檢查是否已經完成遷移
    const migrationDone = localStorage.getItem(`${MIGRATION_DONE_KEY}-${user.uid}`);
    if (migrationDone) return;

    // 檢查是否有本機資料
    const data = getLocalData();
    if (data.receipts.length > 0 || data.achievements.some(a => a.unlocked)) {
      setLocalData(data);
      setIsOpen(true);
    }
  }, [user]);

  // 取得本機資料
  const getLocalData = (): LocalData => {
    let receipts: Receipt[] = [];
    let achievements: Achievement[] = [];
    let aiSettings: AISettings | null = null;
    let storeNames: string[] = [];

    try {
      const storedReceipts = localStorage.getItem(LOCAL_RECEIPTS_KEY);
      if (storedReceipts) {
        receipts = JSON.parse(storedReceipts);
      }
    } catch (e) {
      console.error("Failed to parse receipts:", e);
    }

    try {
      const storedAchievements = localStorage.getItem(LOCAL_ACHIEVEMENTS_KEY);
      if (storedAchievements) {
        achievements = JSON.parse(storedAchievements);
      }
    } catch (e) {
      console.error("Failed to parse achievements:", e);
    }

    try {
      const storedSettings = localStorage.getItem(LOCAL_AI_SETTINGS_KEY);
      if (storedSettings) {
        aiSettings = JSON.parse(storedSettings);
      }
    } catch (e) {
      console.error("Failed to parse AI settings:", e);
    }

    try {
      const storedStoreNames = localStorage.getItem(LOCAL_STORE_NAMES_KEY);
      if (storedStoreNames) {
        storeNames = JSON.parse(storedStoreNames);
      }
    } catch (e) {
      console.error("Failed to parse store names:", e);
    }

    return { receipts, achievements, aiSettings, storeNames };
  };

  // 執行遷移
  const handleMigrate = async () => {
    if (!user || !localData) return;

    setIsMigrating(true);
    setError(null);
    setMigrationProgress(0);

    try {
      const totalItems =
        localData.receipts.length +
        localData.achievements.filter(a => a.unlocked).length +
        (localData.aiSettings ? 1 : 0) +
        (localData.storeNames.length > 0 ? 1 : 0);
      let completedItems = 0;

      // 檢查雲端是否已有資料
      const receiptsRef = collection(db, "users", user.uid, "receipts");
      const existingReceipts = await getDocs(receiptsRef);
      
      if (!existingReceipts.empty) {
        // 如果雲端已有資料，詢問是否合併
        const confirmed = window.confirm(
          "雲端已有收據資料。要合併本機資料嗎？（重複的收據將被跳過）"
        );
        if (!confirmed) {
          setIsMigrating(false);
          return;
        }
      }

      // 取得現有收據 ID
      const existingIds = new Set<string>();
      existingReceipts.forEach((doc) => {
        existingIds.add(doc.id);
      });

      // 遷移收據
      for (const receipt of localData.receipts) {
        if (!existingIds.has(receipt.id)) {
          const receiptRef = doc(db, "users", user.uid, "receipts", receipt.id);
          await setDoc(receiptRef, receipt);
        }
        completedItems++;
        setMigrationProgress((completedItems / totalItems) * 100);
      }

      // 遷移成就
      for (const achievement of localData.achievements.filter(a => a.unlocked)) {
        const achievementRef = doc(db, "users", user.uid, "achievements", achievement.id);
        await setDoc(achievementRef, achievement, { merge: true });
        completedItems++;
        setMigrationProgress((completedItems / totalItems) * 100);
      }

      // 遷移 AI 設定
      if (localData.aiSettings) {
        const settingsRef = doc(db, "users", user.uid, "settings", "ai");
        await setDoc(settingsRef, localData.aiSettings, { merge: true });
        completedItems++;
        setMigrationProgress((completedItems / totalItems) * 100);
      }

      // 遷移商店名稱
      if (localData.storeNames.length > 0) {
        const storeNamesRef = doc(db, "users", user.uid, "settings", "storeNames");
        await setDoc(storeNamesRef, { names: localData.storeNames }, { merge: true });
        completedItems++;
        setMigrationProgress((completedItems / totalItems) * 100);
      }

      // 標記遷移完成
      localStorage.setItem(`${MIGRATION_DONE_KEY}-${user.uid}`, "true");

      // 追蹤遷移事件
      trackEvent("data_migrated", {
        receipts_count: localData.receipts.length,
        achievements_count: localData.achievements.filter(a => a.unlocked).length,
      });

      setSuccess(true);
      
      // 3 秒後關閉
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (e) {
      console.error("Migration failed:", e);
      setError("遷移失敗，請稍後再試");
    } finally {
      setIsMigrating(false);
    }
  };

  // 跳過遷移
  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`${MIGRATION_DONE_KEY}-${user.uid}`, "skipped");
      trackEvent("data_migration_skipped");
    }
    setIsOpen(false);
  };

  if (!isOpen || !localData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* 彈窗內容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md receipt-paper rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 頂部裝飾 */}
          <div className="h-2 bg-gradient-to-r from-[#C41E3A] via-[#B01830] to-[#9A1428]" />

          <div className="p-6">
            {/* 標題 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C41E3A]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#C41E3A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-mono text-lg font-bold text-gray-800">
                  發現本機資料
                </h2>
                <p className="font-mono text-xs text-gray-500">
                  要將資料同步到雲端嗎？
                </p>
              </div>
            </div>

            {/* 分隔線 */}
            <div className="border-t-2 border-dashed border-gray-200 my-4" />

            {success ? (
              /* 成功狀態 */
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <p className="font-mono text-sm text-gray-700 font-medium">
                  遷移完成！
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  您的資料已同步到雲端
                </p>
              </div>
            ) : (
              <>
                {/* 資料統計 */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-mono text-sm text-gray-600">收據</span>
                    <span className="font-mono text-sm font-bold text-gray-800">
                      {localData.receipts.length} 筆
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="font-mono text-sm text-gray-600">已解鎖成就</span>
                    <span className="font-mono text-sm font-bold text-gray-800">
                      {localData.achievements.filter(a => a.unlocked).length} 個
                    </span>
                  </div>
                  {localData.aiSettings?.apiKey && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-mono text-sm text-gray-600">AI 設定</span>
                      <span className="font-mono text-sm font-bold text-gray-800">
                        已配置
                      </span>
                    </div>
                  )}
                  {localData.storeNames.length > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-mono text-sm text-gray-600">記憶的商店</span>
                      <span className="font-mono text-sm font-bold text-gray-800">
                        {localData.storeNames.length} 個
                      </span>
                    </div>
                  )}
                </div>

                {/* 進度條 */}
                {isMigrating && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${migrationProgress}%` }}
                        className="h-full bg-[#C41E3A] rounded-full"
                      />
                    </div>
                    <p className="font-mono text-xs text-gray-500 text-center mt-2">
                      遷移中... {Math.round(migrationProgress)}%
                    </p>
                  </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                  <p className="font-mono text-xs text-red-500 text-center mb-4">
                    {error}
                  </p>
                )}

                {/* 按鈕 */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    disabled={isMigrating}
                    className="flex-1 py-2.5 font-mono text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    稍後再說
                  </button>
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="flex-1 py-2.5 bg-[#C41E3A] text-white font-mono text-sm font-medium rounded-lg hover:bg-[#9A1428] transition-colors disabled:opacity-50"
                  >
                    {isMigrating ? "遷移中..." : "開始遷移"}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

